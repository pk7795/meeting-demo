import { useSession } from 'next-auth/react'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { User } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config'
import { DataContainer, MapContainer, useReactionData, useReactionList } from '@/hooks/common/useReaction'
import { RoomMessageWithUser, RoomPopulated } from '@/types/types'

export const MeetingContext = createContext({} as any)

export interface MeetingUserStatus {
  online: boolean
  joining: string
  audio?: boolean
  video?: boolean
}

export type ParticipatingUser = Partial<User> & {
  is_me: boolean
  online_at?: string
  meetingStatus?: MeetingUserStatus
}

export const MeetingProvider = ({ children, room }: { children: React.ReactNode; room: RoomPopulated | null }) => {
  const { data: session } = useSession()
  const data = useMemo(() => {
    const users = new MapContainer<string, ParticipatingUser>()
    const messages = new MapContainer<string, RoomMessageWithUser>()
    const userState = new DataContainer<MeetingUserStatus>({ online: false, joining: '' })
    const selectedMic = new DataContainer<MediaDeviceInfo | null>(null)
    const selectedCam = new DataContainer<MediaDeviceInfo | null>(null)

    const messagesMap = room!.messages.reduce((acc, message) => {
      acc.set(message.id, {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        user: message.user,
      })
      return acc
    }, new Map<string, RoomMessageWithUser>())
    messages.setBatch(messagesMap)

    const onMessageRoomChanged = (payload: any) => {
      const message = {
        ...payload.new,
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

    let presenceChannelSubscription: RealtimeChannel | null = null
    if (session?.user.id) {
      const userPresenceKey = session?.user.id

      const presenceChannel = supabase.channel(`room:${room!.id}:presence`, {
        config: {
          presence: {
            key: userPresenceKey,
          },
        },
      })

      // TODO: Better handle users state for performance
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = presenceChannel.presenceState()
          const map = new Map<string, ParticipatingUser>()
          for (const key in newState) {
            const userId = (newState[key] as any)[0].id
            if (userId) {
              map.set(userId, {
                is_me: userId === session?.user.id,
                online_at: (newState[key] as any)[0].online_at,
                id: userId,
                name: (newState[key] as any)[0].name,
                image: (newState[key] as any)[0].image,
                meetingStatus: (newState[key] as any)[0].meetingStatus,
              })
            }
          }
          users.setBatch(map)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          const user = users.get(key)
          if (user) {
            users.set(key, {
              ...user,
              meetingStatus: {
                online: false,
                joining: '',
              },
            })
          }
        })

      presenceChannelSubscription = presenceChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          presenceChannel.track({
            user: userPresenceKey,
            online_at: new Date().toISOString(),
            id: session?.user.id,
            name: session?.user.name,
            image: session?.user.image,
            meetingStatus: userState.data,
          })
        }
      })

      userState.addChangeListener(() => {
        presenceChannel.track({
          user: userPresenceKey,
          online_at: new Date().toISOString(),
          id: session?.user.id,
          name: session?.user.name,
          image: session?.user.image,
          meetingStatus: userState.data,
        })
      })
    }

    const destroy = () => {
      roomMessageSubscription.unsubscribe()
      presenceChannelSubscription && presenceChannelSubscription.unsubscribe()
    }

    return {
      users,
      messages,
      userState,
      selectedMic,
      selectedCam,
      destroy,
    }
  }, [room, session?.user.id, session?.user.image, session?.user.name])

  useEffect(() => {
    return data.destroy
  }, [data])

  const setUserState = useCallback(
    (state: MeetingUserStatus) => {
      data.userState.change(state)
    },
    [data.userState]
  )

  return <MeetingContext.Provider value={{ data, setUserState }}>{children}</MeetingContext.Provider>
}

export const useMeeting = () => {
  const context = useContext(MeetingContext)
  return context
}

export const useMeetingMessages = () => {
  const context = useMeeting()
  return useReactionList(context.data.messages)
}

export const useMeetingUsersList = (): ParticipatingUser[] => {
  const context = useMeeting()
  return useReactionList(context.data.users)
}

export const useOnlineMeetingUsersList = (): ParticipatingUser[] => {
  const users = useMeetingUsersList()
  return users.filter((user) => (user as ParticipatingUser).meetingStatus?.online)
}

export const useMeetingUsers = () => {
  const context = useMeeting()
  return context.data.users
}

export const useMeetingUserState = () => {
  const context = useMeeting()
  const state = useReactionData<MeetingUserStatus>(context.data.userState)
  return [state, context.setUserState] as const
}

export const useSelectedMic = () => {
  const context = useMeeting()
  const state = useReactionData<MediaDeviceInfo | null>(context.data.selectedMic)
  return [state, context.data.selectedMic.change] as const
}

export const useSelectedCam = () => {
  const context = useMeeting()
  const state = useReactionData<MediaDeviceInfo | null>(context.data.selectedCam)
  return [state, context.data.selectedCam.change] as const
}
