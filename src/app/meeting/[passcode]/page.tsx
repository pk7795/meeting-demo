import { Meeting } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'
import { RoomAccessStatus } from '@/lib/constants'

export type OneRoom = {
  id: string
  roomId: string
  name: string
  userId: string | null
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  } | null
  messages: {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date
    participantId: string
    participant: {
      id: string
      name: string
      user: {
        id: string
        name: string | null
        image: string | null
      } | null
    }
  }[]
}

export default async function IndexMeeting({ params }: { params: { passcode: string } }) {
  const prisma = getPrisma()
  const session = await getSessionUser()

  const room = await prisma.room.findFirst({
    where: {
      passcode: params?.passcode,
    },
    include: {
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
          participantId: true,
          participant: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!room) {
    throw new Error('RoomNotFound')
  }

  let myParticipant = null
  if (session) {
    myParticipant = await prisma.roomParticipant.findFirst({
      where: {
        roomId: room.id,
        userId: session.id,
      },
    })
  }

  const roomInvite = await prisma.roomInvite.findFirst({
    where: {
      roomId: room.id,
      email: session?.email,
    },
  })

  let access = RoomAccessStatus.JOINED
  if (!session) {
    access = RoomAccessStatus.NEED_ASK
  }

  if (room.ownerId !== session?.id) {
    if (!roomInvite) {
      if (!myParticipant) {
        access = RoomAccessStatus.NEED_ASK
      } else {
        if (!myParticipant.accepted) {
          access = RoomAccessStatus.PENDING
        }
      }
    }
  }

  return <Meeting room={room} myParticipant={myParticipant} access={access} />
}
