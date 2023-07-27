import { UserType } from '../constants'
import { useAudioSlotMix } from 'bluesea-media-react-sdk'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config'
import { DataContainer, MapContainer, useReactionData, useReactionList } from '@/hooks/common/useReaction'
import { MeetingParticipant, RoomMessageWithParticipant, RoomParticipantWithUser, RoomPopulated } from '@/types/types'

type PinnedPaticipant = { p: MeetingParticipant; force?: boolean }

export const MeetingContext = createContext<{
  data: {
    paticipants: MapContainer<string, MeetingParticipant>
    messages: MapContainer<string, RoomMessageWithParticipant>
    participantState: DataContainer<MeetingParticipantStatus>
    joinRequest: DataContainer<{ id: string; name: string; type: UserType } | null>
    pinnedPaticipant: DataContainer<PinnedPaticipant | null>
    talkingParticipantId: DataContainer<string>
    currentPaticipant: RoomParticipant
    pendingParticipants: MapContainer<string, Partial<RoomParticipantWithUser>>
    roomSupabaseChannel: DataContainer<RealtimeChannel>
    destroy: () => void
  }
  setParticipantState: (state: MeetingParticipantStatus) => void
  setPinnedParticipant: (participant: PinnedPaticipant | null) => void
  clearJoinRequest: () => void
  deletePendingParticipant: (participantId: string) => void
}>({} as any)

export interface MeetingParticipantStatus {
  online: boolean
  joining: 'prepare-meeting' | 'meeting' | null
  audio?: boolean
  video?: boolean
  handRaised?: boolean
  screenShare?: boolean
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
  }
  pendingParticipantsList: RoomParticipantWithUser[]
}) => {
  const data = useMemo(() => {
    const paticipants = new MapContainer<string, MeetingParticipant>()
    const messages = new MapContainer<string, RoomMessageWithParticipant>()
    const participantState = new DataContainer<MeetingParticipantStatus>({
      online: true,
      joining: 'meeting',
      handRaised: false,
      screenShare: false,
    })
    const pinnedPaticipant = new DataContainer<PinnedPaticipant | null>(null)
    const joinRequest = new DataContainer<{ id: string; name: string; type: UserType } | null>(null)
    const talkingParticipantId = new DataContainer<string>('')
    const pendingParticipants = new MapContainer<string, Partial<RoomParticipantWithUser>>()
    const roomSupabaseChannel = new DataContainer<RealtimeChannel>({} as any)

    talkingParticipantId.addChangeListener((participantId) => {
      const paticipant = paticipants.get(participantId)
      if (paticipant && !pinnedPaticipant.data?.force) {
        pinnedPaticipant.change({
          p: paticipant,
        })
      }
    })

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

    const pendingMap = pendingParticipantsList.reduce((acc, participant) => {
      acc.set(participant.id, participant)
      return acc
    }, new Map<string, Partial<RoomParticipantWithUser>>())
    pendingParticipants.setBatch(pendingMap)

    const onMessageRoomChanged = (payload: {
      new: {
        id: string
        participantId: string
        createdAt: string
        content: string
        type: string
      }
    }) => {
      const participant = paticipants.get(payload.new.participantId) as any
      const message = {
        ...payload.new,
        participant,
        // TODO: Fix this hack, the date is not being deliver by supabase correctly
        createdAt: new Date(payload.new.createdAt + 'Z'),
      }
      messages.set(payload.new.id, message)
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

            if (!pendingParticipants.has(id)) {
              pendingParticipants.set(id, {
                id,
                name,
                user,
              })
            }

            joinRequest.change({
              id,
              name,
              type,
            })
          }
        }

        if (event === 'screen-share') {
          const screenShare = payload.data.screenShare
          const participantId = payload.participantId
          // TODO: Implement a screen queue that dynamically pin the screen share
          // For now, we just pin the first screen share
          if (screenShare) {
            const participant = paticipants.get(participantId)
            if (participant) {
              pinnedPaticipant.change({
                p: participant,
                force: true,
              })
            }
          } else if (pinnedPaticipant.data?.p.id === participantId) {
            pinnedPaticipant.change(null)
          }
        }
        if (event === 'interact') {
          console.log(payload)
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
            const participantId = (newState[key] as any)[0].id
            if (participantId) {
              map.set(participantId, {
                is_me: participantId === roomParticipant.id,
                online_at: (newState[key] as any)[0].online_at,
                id: participantId,
                name: (newState[key] as any)[0].name,
                user: (newState[key] as any)[0].user,
                meetingStatus: (newState[key] as any)[0].meetingStatus,
              })
            }
          }
          paticipants.setBatch(map)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          const paticipant = paticipants.get(key)
          if (paticipant) {
            paticipants.del(key)
          }
        })

      presenceChannelSubscription = presenceChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          presenceChannel.track({
            online_at: new Date().toISOString(),
            id: roomParticipant.id,
            name: roomParticipant.name,
            user: roomParticipant.user,
            meetingStatus: participantState.data,
          })
        }
      })

      participantState.addChangeListener(() => {
        presenceChannel.track({
          online_at: new Date().toISOString(),
          id: roomParticipant.id,
          name: roomParticipant.name,
          user: roomParticipant.user,
          meetingStatus: participantState.data,
        })
      })
    }

    const destroy = () => {
      supabase.removeChannel(roomMessageSubscription)
      presenceChannelSubscription && supabase.removeChannel(presenceChannelSubscription)
      supabase.removeChannel(roomSupabaseChannel.data)
    }

    return {
      paticipants,
      pinnedPaticipant,
      talkingParticipantId,
      pendingParticipants,
      messages,
      participantState,
      joinRequest,
      roomSupabaseChannel,
      currentPaticipant: roomParticipant,
      destroy,
    }
  }, [])

  useEffect(() => {
    return data.destroy
  }, [data])

  const setParticipantState = useCallback(
    (state: MeetingParticipantStatus) => {
      data.participantState.change(state)
    },
    [data.participantState]
  )

  const clearJoinRequest = useCallback(() => {
    data.joinRequest.change(null)
  }, [data])

  const setTalkingParticipantId = useCallback(
    (participantId: string) => {
      if (data.talkingParticipantId.data === participantId) return
      data.talkingParticipantId.change(participantId)
    },
    [data.talkingParticipantId]
  )

  const setPinnedParticipant = useCallback(
    (participant: PinnedPaticipant | null) => {
      data.pinnedPaticipant.change(participant)
    },
    [data.pinnedPaticipant]
  )

  const deletePendingParticipant = useCallback(
    (participantId: string) => {
      data.pendingParticipants.del(participantId)
    },
    [data.pendingParticipants]
  )

  const audioSlot0 = useAudioSlotMix(0)
  const audioSlot1 = useAudioSlotMix(1)
  const audioSlot2 = useAudioSlotMix(2)

  useEffect(() => {
    //find loudest user slot from audioSlot0, audioSlot1, audioSlot2
    const audioSlot0Level = audioSlot0?.audio_level ?? -Infinity
    const audioSlot1Level = audioSlot1?.audio_level ?? -Infinity
    const audioSlot2Level = audioSlot2?.audio_level ?? -Infinity

    const minAudioLevel = -50

    if (audioSlot0Level > minAudioLevel && audioSlot0Level > audioSlot1Level && audioSlot0Level > audioSlot2Level) {
      setTalkingParticipantId(audioSlot0?.peer_id ?? '')
    } else if (
      audioSlot1Level > minAudioLevel &&
      audioSlot1Level > audioSlot0Level &&
      audioSlot1Level > audioSlot2Level
    ) {
      setTalkingParticipantId(audioSlot1?.peer_id ?? '')
    } else if (
      audioSlot2Level > minAudioLevel &&
      audioSlot2Level > audioSlot0Level &&
      audioSlot2Level > audioSlot1Level
    ) {
      setTalkingParticipantId(audioSlot2?.peer_id ?? '')
    }
  }, [audioSlot0, audioSlot1, audioSlot2, setTalkingParticipantId])

  return (
    <MeetingContext.Provider
      value={{
        data,
        clearJoinRequest,
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
  return useReactionList(context.data.paticipants)
}

export const useOnlineMeetingParticipantsList = (): MeetingParticipant[] => {
  const participants = useMeetingParticipantsList()
  return participants.filter((paticipant) => (paticipant as MeetingParticipant).meetingStatus?.online)
}

export const useMeetingParticipants = () => {
  const context = useMeeting()
  return context.data.paticipants
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

export const useTalkingParticipantId = () => {
  const context = useMeeting()
  const talkingParticipantId = useReactionData<string>(context.data.talkingParticipantId)
  return talkingParticipantId
}

export const useCurrentParticipant = () => {
  const context = useMeeting()
  return context.data.currentPaticipant
}

export const useJoinRequest = () => {
  const context = useMeeting()
  const joinRequest = useReactionData<{ id: string; name: string; type: UserType } | null>(context.data.joinRequest)
  return [joinRequest, context.clearJoinRequest] as const
}

export const usePendingParticipants = () => {
  const context = useMeeting()
  const pendingParticipants = useReactionList<string, Partial<RoomParticipantWithUser>>(
    context.data.pendingParticipants
  )
  return [pendingParticipants, context.deletePendingParticipant] as const
}
