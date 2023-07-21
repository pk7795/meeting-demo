import { UserRole, UserStatus } from '@prisma/client'
import { MeetingWrapped } from '@/containers'
import { env, getPrisma, getSessionUser } from '@/lib'
import { createLiveWebrtcToken } from '@/lib/bluesea'

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
  const session = await getSessionUser()

  if (!session) {
    throw new Error('Unauthorized')
  }

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

  if (!room) {
    throw new Error('RoomNotFound')
  }

  let userParticipated = await prisma.roomParticipant.findFirst({
    where: {
      userId: session.id,
      roomId: room.id,
    },
  })

  if (!userParticipated) {
    const userInvited = await prisma.roomInvite.findFirst({
      where: {
        email: session.email,
        roomId: room.id,
      },
    })

    if (!userInvited) {
      throw new Error('Unauthorized')
    }

    //TODO check valid invite

    userParticipated = await prisma.roomParticipant.create({
      data: {
        name: session.name,
        roomId: room.id as string,
        userId: session.id,
      },
    })
  }

  //create bluesea join token
  const token = await createLiveWebrtcToken(
    room.id,
    userParticipated.userId || userParticipated.id,
    env.BLUESEA_CONFIG,
    false
  )
  const blueseaConfig = {
    room: room.id,
    peer: userParticipated.userId || userParticipated.id,
    gateway: env.BLUESEA_CONFIG.gateway,
    token: token,
  }

  return <MeetingWrapped room={room} participated={userParticipated} bluesea={blueseaConfig} />
}
