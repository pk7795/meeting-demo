import { UserType } from '@/lib/constants'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config'
import { DataContainer, MapContainer, useReactionData, useReactionList } from '@/hooks/common/useReaction'
import { MeetingParticipant, RoomMessageWithParticipant, RoomParticipantWithUser, RoomPopulated } from '@/types/types'
import { JoinInfo } from '@atm0s-media-sdk/core'
import { RemotePeer, useSession } from '@atm0s-media-sdk/react-hooks'

type PinnedParticipant = { p: JoinInfo | RemotePeer; force?: boolean, name?: string }

export const MeetingContext = createContext<{
  data: {
    participants: MapContainer<string, MeetingParticipant>
    participantState: DataContainer<MeetingParticipantStatus>
    joinRequest: DataContainer<{ id: string; name: string; type: UserType } | null>
    receiveMessage: DataContainer<RoomMessageWithParticipant | null>
    pinnedParticipant: DataContainer<PinnedParticipant | null>
    currentParticipant: RoomParticipant
    pendingParticipants: MapContainer<string, Partial<RoomParticipantWithUser>>
    roomSupabaseChannel: DataContainer<RealtimeChannel>
    isConnected: DataContainer<boolean | null>
    destroy: () => void
  }
  setParticipantState: (state: MeetingParticipantStatus) => void
  setPinnedParticipant: (participant: PinnedParticipant | null) => void
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
    lastAccessedAt: Date
  }
  pendingParticipantsList: RoomParticipantWithUser[]
}) => {

  const data = useMemo(() => {
    const participants = new MapContainer<string, MeetingParticipant>()
    const participantState = new DataContainer<MeetingParticipantStatus>({
      online: true,
      joining: 'meeting',
      handRaised: false,
      screenShare: false,
    })
    const pinnedParticipant = new DataContainer<PinnedParticipant | null>(null)
    const joinRequest = new DataContainer<{ id: string; name: string; type: UserType } | null>(null)
    const receiveMessage = new DataContainer<RoomMessageWithParticipant | null>(null)
    const pendingParticipants = new MapContainer<string, Partial<RoomParticipantWithUser>>()
    const roomSupabaseChannel = new DataContainer<RealtimeChannel>({} as any)
    const isConnected = new DataContainer<boolean | null>(null)

    const pendingMap = pendingParticipantsList.reduce((acc, participant) => {
      acc.set(participant.id, participant)
      return acc
    }, new Map<string, Partial<RoomParticipantWithUser>>())
    pendingParticipants.setBatch(pendingMap)


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
      .subscribe(() => { })

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
          participants.setBatch(map)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log('leave', key)
          const participant = participants.get(key)
          if (participant) {
            participants.del(key)
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
      presenceChannelSubscription && supabase.removeChannel(presenceChannelSubscription)
      supabase.removeChannel(roomSupabaseChannel.data)
    }

    return {
      participants,
      pinnedParticipant,
      pendingParticipants,
      participantState,
      joinRequest,
      receiveMessage,
      roomSupabaseChannel,
      isConnected,
      currentParticipant: roomParticipant,
      destroy,
    }
  }, [pendingParticipantsList, room, roomParticipant])

  const session = useSession()

  useEffect(() => {
    return data.destroy
  }, [data])

  console.log(' RENDER --------------------------------------------------------')

  useEffect(() => {
    session.connect()
  }, [session])

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
    (participant: PinnedParticipant | null) => {
      data.pinnedParticipant.change(participant)
    },
    [data.pinnedParticipant]
  )

  const deletePendingParticipant = useCallback(
    (participantId: string) => {
      data.pendingParticipants.del(participantId)
    },
    [data.pendingParticipants]
  )


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
export const useRoomSupabaseChannel = () => {
  const context = useMeeting()
  return useReactionData<RealtimeChannel>(context.data.roomSupabaseChannel)
}

export const useMeetingParticipantsList = (): MeetingParticipant[] => {
  const context = useMeeting()
  const list = useReactionList(context.data.participants)
  return list
}

export const useOnlineMeetingParticipantsList = (): MeetingParticipant[] => {
  const participants = useMeetingParticipantsList()
  return participants
    .filter((participant) => (participant as MeetingParticipant).meetingStatus?.online)
    .map((participant) => ({
      ...participant,
      connected_at: participant.connected_at || 0,
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
  const pinnedParticipant = useReactionData<PinnedParticipant | null>(context.data.pinnedParticipant)
  return [pinnedParticipant, context.setPinnedParticipant] as const
}

export const useCurrentParticipant = () => {
  const context = useMeeting()
  return context.data.currentParticipant
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

export const useIsConnected = () => {
  const context = useMeeting()
  const isConnected = useReactionData<boolean | null>(context.data.isConnected)
  return isConnected
}
