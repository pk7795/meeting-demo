import { UserRole, UserStatus } from '@prisma/client'
import { Meeting } from '@/containers'
import { getPrisma } from '@/lib'

export type OneUserInvite = {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
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
