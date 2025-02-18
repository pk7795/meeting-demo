'use server'

import { getPrisma, getSessionUser } from '@/lib'
import { genPasscode } from '@/utils'

export async function createRoom() {
  const prisma = getPrisma()
  const session = await getSessionUser()
  let passcode = genPasscode()
  let findRoom = await prisma.room.findFirst({
    where: {
      passcode,
    },
  })

  while (findRoom) {
    passcode = genPasscode()
    findRoom = await prisma.room.findFirst({
      where: {
        passcode,
      },
    })
  }

  if (!findRoom) {
    const res = await prisma.room.create({
      data: {
        name: passcode,
        passcode,
        ownerId: session?.id as string,
      },
    })

    return res
  }
}
