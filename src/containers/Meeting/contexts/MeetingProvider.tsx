import { MIN_AUDIO_LEVEL, UserType } from '../constants'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config'
import { useAudioSlotsQueueContainer } from '@/hooks'
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
    currentPaticipant: RoomParticipant
    pendingParticipants: MapContainer<string, Partial<RoomParticipantWithUser>>
    roomSupabaseChannel: DataContainer<RealtimeChannel>
    talkingParticipants: MapContainer<string, { peerId: string; ts: number }>
    isConnected: DataContainer<boolean>
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
    const pendingParticipants = new MapContainer<string, Partial<RoomParticipantWithUser>>()
    const roomSupabaseChannel = new DataContainer<RealtimeChannel>({} as any)
    const isConnected = new DataContainer<boolean>(false)

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
              const payload = {
                is_me: participantId === roomParticipant.id,
                online_at: (newState[key] as any)[0].online_at,
                id: participantId,
                name: (newState[key] as any)[0].name,
                user: (newState[key] as any)[0].user,
                connected_at: (newState[key] as any)[0].connected_at,
                meetingStatus: (newState[key] as any)[0].meetingStatus,
              }
              map.set(participantId, payload)
            }
          }
          paticipants.setBatch(map)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log('leave', key)
          const paticipant = paticipants.get(key)
          if (paticipant) {
            paticipants.del(key)
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
          connected_at: (state[roomParticipant.id][0] as any).connected_at,
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
      pendingParticipants,
      messages,
      participantState,
      joinRequest,
      roomSupabaseChannel,
      isConnected,
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

  const talkingParticipants = useAudioSlotsQueueContainer(3, -1000)
  talkingParticipants.onListChanged((list) => {
    if (list.length > 0 && list[0].peerId) {
      const sorted = list.sort((a, b) => a.ts - b.ts)
      let selected = sorted[0].peerId
      const pinned = sorted.find((p) => p.peerId === data.pinnedPaticipant?.data?.p?.id)
      if (pinned) {
        selected = sorted.find((p) => p.audioLevel - pinned.audioLevel > 20)?.peerId || pinned.peerId
      }
      if (!data.pinnedPaticipant?.data?.force) {
        setPinnedParticipant({
          p: data.paticipants.get(selected),
          force: false,
        })
      }
    }
  })

  return (
    <MeetingContext.Provider
      value={{
        data: {
          ...data,
          talkingParticipants,
        },
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
  const list = useReactionList(context.data.paticipants)
  return list
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

export const useTalkingParticipants = () => {
  const context = useMeeting()
  const talkingParticipants = useReactionList<string, { peerId: string; ts: number }>(context.data.talkingParticipants)
  return talkingParticipants
}

export const useIsConnected = () => {
  const context = useMeeting()
  const isConnected = useReactionData<boolean>(context.data.isConnected)
  return isConnected
}
