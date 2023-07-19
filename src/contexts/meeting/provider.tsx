import { createContext, useContext, useMemo, useState } from 'react'
import { Messages, Room, User } from '@prisma/client'
import { MapContainer, useReactionList } from '@/hooks/common/useReaction'
import { getSupabase } from '@/lib/supabase'

export const MeetingContext = createContext({} as any)

export const MeetingProvider = ({ children, room }: { children: React.ReactNode; room: Partial<Room> | null }) => {
  const supabase = getSupabase()
  const data = useMemo(() => {
    const users = new MapContainer<string, User>()
    const messages = new MapContainer<string, Messages>()
    const onMessageRoomChanged = (payload: any) => {
      console.log('changes', payload)
      messages.set(payload.new.id, payload.new)
    }

    const onUserRoomJoined = (payload: User) => {
      users.set(payload.id, payload)
    }

    const onUserRoomLeaved = (payload: User) => {
      users.del(payload.id)
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

    return {
      users,
      messages,
    }
  }, [room, supabase])

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
