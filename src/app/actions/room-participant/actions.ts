'use server'

import { RoomParticipantInput } from './types'
import { getPrisma, getSessionUser } from '@/lib'

//TODO add more user_id checks
export async function createRoomParticipant({ data }: { data: RoomParticipantInput }) {
  const prisma = getPrisma()
  const session = await getSessionUser()
  const passcode = data.passcode
  const room = await prisma.room.findFirst({
    where: {
      passcode,
    },
  })

  const res = await prisma.roomParticipant.create({
    data: {
      name: data.name,
      roomId: room?.id as string,
      userId: (session?.id as string) || null,
    },
  })
  return res
}
