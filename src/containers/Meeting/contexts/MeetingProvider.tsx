import { useAudioSlotMix } from 'bluesea-media-react-sdk'
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config'
import { DataContainer, MapContainer, useReactionData, useReactionList } from '@/hooks/common/useReaction'
import { RoomMessageWithParticipant, RoomPopulated } from '@/types/types'

type PinnedPaticipant = { p: MeetingParticipant; force?: boolean }

export const MeetingContext = createContext<{
  data: {
    paticipants: MapContainer<string, MeetingParticipant>
    messages: MapContainer<string, RoomMessageWithParticipant>
    participantState: DataContainer<MeetingParticipantStatus>

    pinnedPaticipant: DataContainer<PinnedPaticipant | null>
    talkingParticipantId: DataContainer<string>
    currentPaticipant: RoomParticipant
    destroy: () => void
  }
  setParticipantState: (state: MeetingParticipantStatus) => void
  setPinnedParticipant: (participant: PinnedPaticipant | null) => void
}>({} as any)

export interface MeetingParticipantStatus {
  online: boolean
  joining: 'prepare-meeting' | 'meeting' | null
  audio?: boolean
  video?: boolean
}

export type MeetingParticipant = Partial<RoomParticipant> & {
  is_me: boolean
  online_at?: string
  meetingStatus?: MeetingParticipantStatus
  user?: {
    name: string
    image: string
  }
}

export const MeetingProvider = ({
  children,
  room,
  roomParticipant,
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
    joinedAt: Date
    createdAt: Date
    updatedAt: Date
  }
}) => {
  const data = useMemo(() => {
    const paticipants = new MapContainer<string, MeetingParticipant>()
    const messages = new MapContainer<string, RoomMessageWithParticipant>()
    const participantState = new DataContainer<MeetingParticipantStatus>({ online: true, joining: 'meeting' })

    const pinnedPaticipant = new DataContainer<PinnedPaticipant | null>(null)
    const talkingParticipantId = new DataContainer<string>('')

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
      roomMessageSubscription.unsubscribe()
      presenceChannelSubscription && presenceChannelSubscription.unsubscribe()
    }

    return {
      paticipants,
      pinnedPaticipant,
      talkingParticipantId,
      messages,
      participantState,
      currentPaticipant: roomParticipant,
      destroy,
    }
  }, [room, roomParticipant])

  useEffect(() => {
    return data.destroy
  }, [data])

  const setParticipantState = useCallback(
    (state: MeetingParticipantStatus) => {
      data.participantState.change(state)
    },
    [data.participantState]
  )

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
    <MeetingContext.Provider value={{ data, setParticipantState, setPinnedParticipant }}>
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
