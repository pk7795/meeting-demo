import { Room } from '@/containers'
import { getPrisma } from '@/lib'
import { RoomAccessStatus } from '@/lib/constants'
import { getSessionUser } from '@/lib/session'
import { RoomParticipantWithUser } from '@/types/types'
import { headers } from 'next/headers'

interface PageProps {
  params: {
    room: string
  }
}
export default async function Page({ params }: PageProps) {
  const headersList = await headers()
  const host = headersList.get('host')

  const prisma = getPrisma()
  const session = await getSessionUser()

  const room = await prisma.room.findFirst({
    where: {
      passcode: params.room,
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
  let pendingParticipants: RoomParticipantWithUser[] = []
  pendingParticipants = await prisma.roomParticipant.findMany({
    where: {
      roomId: room.id,
      accepted: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })

  return (
    <Room host={host} room={room} myParticipant={myParticipant} access={access} pendingParticipants={pendingParticipants} />
  )
}
