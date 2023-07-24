import { Meeting } from '@/containers'
import { getPrisma } from '@/lib'

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

  return <Meeting room={room} />
}
