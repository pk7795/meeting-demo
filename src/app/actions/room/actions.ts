'use server'

import { generateRandomString, getPrisma, getSessionUser } from '@/lib'
import { RoomInput } from './types'

export async function createRoom({ data }: { data: RoomInput }) {
  const prisma = getPrisma()
  const session = await getSessionUser()
  let passcode = generateRandomString(8)
  let findRoom = await prisma.room.findFirst({
    where: {
      passcode,
    },
  })

  while (findRoom) {
    passcode = generateRandomString(8)
    findRoom = await prisma.room.findFirst({
      where: {
        passcode,
      },
    })
  }

  if (!findRoom) {
    const res = await prisma.room.create({
      data: {
        ...data,
        passcode,
        ownerId: session?.id as string,
      },
    })
    return res
  }
}
