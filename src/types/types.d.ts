import { Prisma, Room } from '@prisma/client'

// TODO: abstract inclusion of Prisma types
export type RoomParticipants = Prisma.RoomParticipantsGetPayload<{
  select: { id: true; name: true; image: true }
}>
export type RoomMessageWithUser = Prisma.MessagesGetPayload<{
  select: {
    id: true
    content: true
    createdAt: true
    user: { select: { id: true; name: true; image: true } }
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
  messages: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
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
