import { Prisma } from '@prisma/client'

// TODO: abstract inclusion of Prisma types
export type RoomParticipants = Prisma.RoomParticipantsGetPayload<{
  select: { id: true; name: true; image: true }
}>
export type RoomMessageWithParticipant = Prisma.MessagesGetPayload<{
  select: {
    id: true
    content: true
    createdAt: true
    participant: {
      select: {
        id: true
        name: true
        user: { select: { id: true; name: true; image: true } }
      }
    }
  }
}>

export const roomInclude = Prisma.validator<Prisma.RoomInclude>()({
  participants: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
})

export type RoomPopulated = Prisma.RoomGetPayload<{
  include: typeof roomInclude
}>

export type NotificationOptions = {
  message: string
  description: string
  buttons: {
    confirm?: string
    onConfirm: () => void
    cancel: string
    onCancel: () => void
  }
}

export type RoomParticipantWithUser = Prisma.RoomParticipantGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        image: true
      }
    }
  }
}>

export type MeetingParticipant = Partial<RoomParticipant> & {
  is_me: boolean
  online_at?: string
  meetingStatus?: MeetingParticipantStatus
  handRaised?: boolean
  user?: {
    name: string
    image: string
  }
}
