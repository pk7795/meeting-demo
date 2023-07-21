import { UserRole, UserStatus } from '@prisma/client'
import { MeetingWrapped } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'

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

export default async function IndexMeeting({ params }: { params: { passcode?: string } }) {
  const prisma = getPrisma()
  const session = await getSessionUser()
  const userParticipated = await prisma.roomParticipant.findFirst({
    where: {
      userId: session?.id,
    },
  })

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
    },
  })

  return <MeetingWrapped room={room} participated={!!userParticipated} />
}
