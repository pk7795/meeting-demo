import { UserType } from '@/lib/constants'
import { MeetingParticipant, RoomParticipantWithUser } from '@/types/types'
import { atom } from 'jotai'

export const participantsAtom = atom<Map<string, MeetingParticipant>>(new Map())

export const joinRequestAtom = atom<{ id: string; name: string; type: UserType } | null>(null)

export const pendingParticipantsAtom = atom<Map<string, Partial<RoomParticipantWithUser>>>(new Map())
