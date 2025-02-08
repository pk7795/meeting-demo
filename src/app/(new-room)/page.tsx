import { NewRoom } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'

export default async function NewRoomScreen() {
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

    // myRooms = await prisma.room.findMany({
    //   where: {
    //     ownerId: session?.id,
    //   },
    // })
  }
  return <NewRoom roomInvite={roomInvite} />
}
