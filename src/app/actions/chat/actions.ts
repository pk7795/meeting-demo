'use server'

import { MessageInput } from './types'
import { getPrisma } from '@/lib'

export async function fetchMessages({ passcode }: { passcode: string }) {
  const prisma = getPrisma()

  const res = await prisma.messages.findMany({
    where: {
      room: {
        passcode,
      },
    },
  })
  return res
}

export async function createMessage({ data }: { data: MessageInput }) {
  const prisma = getPrisma()

  const res = await prisma.messages.create({
    data: {
      ...data,
    },
  })
  return res
}
