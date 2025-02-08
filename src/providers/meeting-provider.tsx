import { useSidebar } from '@/components/ui/sidebar'
import { supabase } from '@/config'
import { useDeviceStream } from '@/hooks'
import { DataContainer, MapContainer, useReactionData, useReactionList } from '@/hooks/use-reaction'
import { UserType } from '@/lib/constants'
import { joinRequestAtom, participantsAtom, pendingParticipantsAtom } from '@/stores/participants'
import { MeetingParticipant, RoomMessageWithParticipant, RoomParticipantWithUser, RoomPopulated } from '@/types/types'
import { BitrateControlMode, Kind, usePublisher, useSession } from '@atm0s-media-sdk/react-hooks'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAtom } from 'jotai'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'

type PinnedPaticipant = { p: MeetingParticipant; force?: boolean }

export interface MeetingParticipantStatus {
  online: boolean
  joining: 'prepare-meeting' | 'meeting' | null
  audio?: boolean
  video?: boolean
  handRaised?: boolean
  screenShare?: boolean
}
export const MeetingContext = createContext<{
  data: {
    participants: Map<string, MeetingParticipant>
    messages: MapContainer<string, RoomMessageWithParticipant>
    participantState: DataContainer<MeetingParticipantStatus>
    joinRequest: { id: string; name: string; type: UserType } | null
    receiveMessage: DataContainer<RoomMessageWithParticipant | null>
    pinnedPaticipant: DataContainer<PinnedPaticipant | null>
    currentPaticipant: RoomParticipant
    pendingParticipants: Map<string, Partial<RoomParticipantWithUser>>
    roomSupabaseChannel: DataContainer<RealtimeChannel>
    isConnected: DataContainer<boolean | null>
    destroy: () => void
  }
  setParticipantState: (state: MeetingParticipantStatus) => void
  setPinnedParticipant: (participant: PinnedPaticipant | null) => void
  clearJoinRequest: () => void
  clearReceiveMessage: () => void
  deletePendingParticipant: (participantId: string) => void
}>({} as any)
const PUBLISHER_CONFIG = {
  simulcast: true,
  priority: 1,
  bitrate: BitrateControlMode.DYNAMIC_CONSUMERS,
}
export const MeetingProvider = ({
  children,
  room,
  roomParticipant,
  pendingParticipantsList,
}: {
  children: React.ReactNode
  room: RoomPopulated | null
  roomParticipant: {
    id: string
    roomId: string
    name: string
    userId: string | null
    user?: {
      id: string
      name: string
      image: string
    }
    accepted: boolean
    joinedAt: Date
    createdAt: Date
    updatedAt: Date
    lastAccessedAt: Date
  }
  pendingParticipantsList: RoomParticipantWithUser[]
}) => {
  const [participants, setParticipants] = useAtom(participantsAtom)
  const [joinRequest, setJoinRequestState] = useAtom(joinRequestAtom)
  const [pendingParticipants, setPendingParticipants] = useAtom(pendingParticipantsAtom)

  const data = useMemo(() => {
    const messages = new MapContainer<string, RoomMessageWithParticipant>()
    const participantState = new DataContainer<MeetingParticipantStatus>({
      online: true,
      joining: 'meeting',
      handRaised: false,
      screenShare: false,
    })
    const pinnedPaticipant = new DataContainer<PinnedPaticipant | null>(null)
    const receiveMessage = new DataContainer<RoomMessageWithParticipant | null>(null)
    const roomSupabaseChannel = new DataContainer<RealtimeChannel>({} as any)
    const isConnected = new DataContainer<boolean | null>(null)
    const messagesMap = room!.messages.reduce((acc, message) => {
      acc.set(message.id, {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        participant: message.participant,
      })
      return acc
    }, new Map<string, RoomMessageWithParticipant>())
    messages.setBatch(messagesMap)

    setPendingParticipants(() => {
      const map = new Map<string, Partial<RoomParticipantWithUser>>()
      pendingParticipantsList.forEach((participant) => {
        map.set(participant.id, participant)
      })
      return map
    })

    const onMessageRoomChanged = (payload: {
      new: {
        id: string
        participantId: string
        createdAt: string
        content: string
        type: string
      }
    }) => {
      console.log('--------------------------------------------------------')
      console.log('onMessageRoomChanged', new Date().getTime())
      console.log('--------------------------------------------------------')
      const participant = participants.get(payload.new.participantId)
      const message = {
        ...payload.new,
        participant,
        // TODO: Fix this hack, the date is not being deliver by supabase correctly
        createdAt: new Date(payload.new.createdAt + 'Z'),
      }
      messages.set(payload.new.id, message)
      receiveMessage.change(message)
    }

    const roomMessageSubscription = supabase
      .channel(`room:${room!.id}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Messages',
          filter: 'roomId=eq.' + room!.id,
        },
        onMessageRoomChanged
      )
      .subscribe()

    roomSupabaseChannel.change(supabase.channel(`room:${room!.id}`))

    roomSupabaseChannel.data
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        if (roomParticipant?.user?.id === room!.ownerId) {
          if (event === 'ask') {
            const id = payload.id
            const name = payload.name
            const type = payload.type
            const user = payload.user

            setPendingParticipants((prev) => {
              const newMap = new Map(prev)
              if (!newMap.has(id)) {
                newMap.set(id, { id, name, user })
              }
              return newMap
            })

            setJoinRequestState({
              id,
              name,
              type,
            })
          }
        }
      })
      .subscribe((status) => {})
    let presenceChannelSubscription: RealtimeChannel | null = null
    if (roomParticipant.id) {
      const participantPresenceKey = roomParticipant.id

      const presenceChannel = supabase.channel(`room:${room!.id}:presence`, {
        config: {
          presence: {
            key: participantPresenceKey,
          },
        },
      })

      // TODO: Better handle users state for performance
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = presenceChannel.presenceState()

          const map = new Map<string, MeetingParticipant>()
          for (const key in newState) {
            if (!(newState[key] as any)) {
              continue
            }
            const value = (newState[key] as any)[0]
            if (value) {
              const participantId = value.id
              if (participantId) {
                const payload = {
                  is_me: participantId === roomParticipant.id,
                  online_at: value.online_at,
                  id: participantId,
                  name: value.name,
                  user: value.user,
                  connected_at: value.connected_at,
                  meetingStatus: value.meetingStatus,
                }
                map.set(participantId, payload)
              }
            }
          }
          setParticipants(map)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log('leave', key)
          // just update here
          if (participants.has(key)) {
            const newMap = new Map(participants)
            newMap.delete(key)
            setParticipants(newMap)
          }
        })

      presenceChannelSubscription = presenceChannel.subscribe((status) => {
        console.log('Presence Status:', status)
        if (status === 'SUBSCRIBED') {
          if (!isConnected.data) {
            isConnected.change(true)
          }
          presenceChannel.track({
            online_at: Date.now(),
            id: roomParticipant.id,
            name: roomParticipant.name,
            user: roomParticipant.user,
            meetingStatus: participantState.data,
            connected_at: Date.now(),
          })
        } else {
          if (isConnected.data) {
            isConnected.change(false)
          }
        }
      })

      participantState.addChangeListener(() => {
        const state = presenceChannel.presenceState()

        presenceChannel.track({
          online_at: Math.floor(Date.now()) / 1000,
          id: roomParticipant.id,
          name: roomParticipant.name,
          user: roomParticipant.user,
          meetingStatus: participantState.data,
          connected_at: (state[roomParticipant.id]?.[0] as any)?.connected_at || Date.now(),
        })
      })
    }

    const destroy = () => {
      supabase.removeChannel(roomMessageSubscription)
      presenceChannelSubscription && supabase.removeChannel(presenceChannelSubscription)
      supabase.removeChannel(roomSupabaseChannel.data)
    }

    return {
      participants,
      pinnedPaticipant,
      pendingParticipants,
      messages,
      participantState,
      joinRequest,
      receiveMessage,
      roomSupabaseChannel,
      isConnected,
      currentPaticipant: roomParticipant,
      destroy,
    }
  }, [])

  useEffect(() => {
    return data.destroy
  }, [data])

  console.log(' RENDER --------------------------------------------------------')

  const session = useSession()
  const { toggleSidebar } = useSidebar()

  const videoPublisher = usePublisher('video_main', Kind.VIDEO, PUBLISHER_CONFIG)
  const videoStream = useDeviceStream('video_main')
  const audioPublisher = usePublisher('audio_main', Kind.AUDIO)
  const audioStream = useDeviceStream('audeo_main')
  const screenPublisher = usePublisher('video_screen', Kind.VIDEO)
  const screenStream = useDeviceStream('video_screen')

  const audioTrack = audioStream?.getAudioTracks()[0]
  if (audioTrack && !audioPublisher.attached) {
    audioPublisher.attach(audioTrack)
  } else if (!audioTrack && audioPublisher.attached) {
    audioPublisher.detach()
  }

  const videoTrack = videoStream?.getVideoTracks()[0]
  if (videoTrack && !videoPublisher.attached) {
    videoPublisher.attach(videoTrack)
  } else if (!videoTrack && videoPublisher.attached) {
    videoPublisher.detach()
  }

  const screenTrack = screenStream?.getVideoTracks()[0]
  if (screenTrack && !screenPublisher.attached) {
    screenPublisher.attach(screenTrack)
  } else if (!screenTrack && screenPublisher.attached) {
    screenPublisher.detach()
  }

  useEffect(() => {
    session
      .connect()
      .then(() => {
        console.log('session connected')
      })
      .catch((e) => {
        console.log('session failed to connect', e)
      })
    toggleSidebar()
  }, [session])
  const setParticipantState = useCallback(
    (state: MeetingParticipantStatus) => {
      data.participantState.change(state)
    },
    [data.participantState]
  )

  const clearJoinRequest = useCallback(() => {
    setJoinRequestState(null)
  }, [setJoinRequestState])

  const clearReceiveMessage = useCallback(() => {
    data.receiveMessage.change(null)
  }, [data])

  const setPinnedParticipant = useCallback(
    (participant: PinnedPaticipant | null) => {
      data.pinnedPaticipant.change(participant)
    },
    [data.pinnedPaticipant]
  )

  const deletePendingParticipant = useCallback(
    (participantId: string) => {
      setPendingParticipants((prev) => {
        const newMap = new Map(prev)
        newMap.delete(participantId)
        return newMap
      })
    },
    [setPendingParticipants]
  )

  return (
    <MeetingContext.Provider
      value={{
        data,
        clearJoinRequest,
        clearReceiveMessage,
        deletePendingParticipant,
        setParticipantState,
        setPinnedParticipant,
      }}
    >
      {children}
    </MeetingContext.Provider>
  )
}
export const useMeeting = () => {
  const context = useContext(MeetingContext)
  return context
}

export const useMeetingMessages = () => {
  const context = useMeeting()
  return useReactionList(context.data.messages)
}

export const useRoomSupabaseChannel = () => {
  const context = useMeeting()
  return useReactionData<RealtimeChannel>(context.data.roomSupabaseChannel)
}

export const useMeetingParticipantsList = (): MeetingParticipant[] => {
  const context = useMeeting()
  return Array.from(context.data.participants.values())
}

export const useOnlineMeetingParticipantsList = (): MeetingParticipant[] => {
  const participants = useMeetingParticipantsList()
  return participants
    .filter((paticipant) => (paticipant as MeetingParticipant).meetingStatus?.online)
    .map((paticipant) => ({
      ...paticipant,
      connected_at: paticipant.connected_at || 0,
    }))
    .sort((a, b) => a.connected_at - b.connected_at)
}

export const useMeetingParticipants = () => {
  const context = useMeeting()
  return context.data.participants
}

export const useMeetingParticipantState = () => {
  const context = useMeeting()
  const state = useReactionData<MeetingParticipantStatus>(context.data.participantState)
  return [state, context.setParticipantState] as const
}

export const usePinnedParticipant = () => {
  const context = useMeeting()
  const pinnedPaticipant = useReactionData<PinnedPaticipant | null>(context.data.pinnedPaticipant)
  return [pinnedPaticipant, context.setPinnedParticipant] as const
}

export const useCurrentParticipant = () => {
  const context = useMeeting()
  return context.data.currentPaticipant
}

export const useJoinRequest = () => {
  const context = useMeeting()

  return [context.data.joinRequest, context.clearJoinRequest] as const
}

export const useReceiveMessage = () => {
  const context = useMeeting()
  const receiveMessage = useReactionData<RoomMessageWithParticipant | null>(context.data.receiveMessage)
  return [receiveMessage, context.clearReceiveMessage] as const
}

export const usePendingParticipants = () => {
  const context = useMeeting()
  console.log('context.data.pendingParticipants', context.data.pendingParticipants)

  return [context.data.pendingParticipants, context.deletePendingParticipant] as const
}

export const useIsConnected = () => {
  const context = useMeeting()
  const isConnected = useReactionData<boolean | null>(context.data.isConnected)
  return isConnected
}
