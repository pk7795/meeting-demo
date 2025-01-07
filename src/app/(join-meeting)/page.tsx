import { WrappedJoinMeeting } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'

export type OneRoomInvite = {
  id: string
  roomId: string
  email: string
  createdAt: Date
  updatedAt: Date
  validUntil: Date
  room: {
    id: string
    name: string
    passcode: string | null
    record: boolean
    ownerId: string
    createdAt: Date
    updatedAt: Date
  }
}

export type OneMyRooms = {
  id: string
  name: string
  passcode: string | null
  record: boolean
  ownerId: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export default async function IndexJoinMeeting() {
  const prisma = getPrisma()
  const session = await getSessionUser()

  let roomInvite = null
  let myRooms = null
  if (session?.id) {
    roomInvite = await prisma.roomInvite.findMany({
      where: {
        email: {
          equals: session?.email,
        },
      },
      include: {
        room: true,
      },
    })

    myRooms = await prisma.room.findMany({
      where: {
        ownerId: session?.id,
      },
    })
  }

  return <WrappedJoinMeeting roomInvite={roomInvite} myRooms={myRooms} />
}
