import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { Messages, User } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { MapContainer, useReactionList } from '@/hooks/common/useReaction'
import { getSupabase } from '@/lib/supabase'
import { RoomWithParticipants } from '@/types/types'

export const MeetingContext = createContext({} as any)

export const MeetingProvider = ({
  children,
  room,
}: {
  children: React.ReactNode
  room: RoomWithParticipants | null
}) => {
  const supabase = getSupabase()
  const { data: session } = useSession()
  const data = useMemo(() => {
    const users = new MapContainer<string, Partial<User> & { online_at?: string; active?: boolean }>()
    const messages = new MapContainer<string, Messages>()
    const onMessageRoomChanged = (payload: any) => {
      messages.set(payload.new.id, payload.new)
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
      console.log('key', userPresenceKey)

      const presenceChannel = supabase.channel(`room:${room!.id}:presence`, {
        config: {
          presence: {
            key: userPresenceKey,
          },
        },
      })

      // TODO: Better handle users state for performance
      presenceChannelSubscription = presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = presenceChannel.presenceState()
          for (const key in newState) {
            const userId = (newState[key] as any)[0].id
            if (userId) {
              users.set(userId, {
                online_at: (newState[key] as any)[0].online_at,
                id: userId,
                name: (newState[key] as any)[0].name,
                image: (newState[key] as any)[0].image,
                active: true,
              })
            }
          }
          console.log('sync', newState)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('join', key, newPresences)
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          const user = users.get(key)
          if (user) {
            users.set(key, {
              ...user,
              active: false,
            })
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const presenceTrackStatus = await presenceChannel.track({
              user: userPresenceKey,
              online_at: new Date().toISOString(),
              id: session?.user.id,
              name: session?.user.name,
              image: session?.user.image,
              active: true,
            })
            console.log(presenceTrackStatus)
          }
        })
    }

    const destroy = () => {
      roomMessageSubscription.unsubscribe()
      presenceChannelSubscription && presenceChannelSubscription.unsubscribe()
    }

    return {
      users,
      messages,
      destroy,
    }
  }, [room, session?.user.id, session?.user.image, session?.user.name, supabase])

  useEffect(() => {
    return data.destroy
  }, [data])

  return <MeetingContext.Provider value={{ data }}>{children}</MeetingContext.Provider>
}

export const useMeeting = () => {
  const context = useContext(MeetingContext)
  return context
}

export const useMeetingMessages = () => {
  const context = useMeeting()
  return useReactionList(context.data.messages)
}

export const useMeetingUsersList = () => {
  const context = useMeeting()
  return useReactionList(context.data.users)
}

export const useMeetingUsers = () => {
  const context = useMeeting()
  return context.data.users
}
