'use server'

import { getPrisma } from '@/lib'
import { map } from 'lodash'
import { InviteToRoomInput } from './types'

const DURATION_7DAYS_MS = 1000 * 60 * 60 * 24 * 7

export async function inviteToRoom({ data }: { data: InviteToRoomInput[] }) {
  const prisma = getPrisma()
  const passcode = data[0].passcode
  const room = await prisma.room.findFirst({
    where: {
      passcode,
    },
  })
  const mapData = map(data, (d) => ({
    roomId: room?.id as string,
    email: d.email,
    validUntil: new Date(Date.now() + DURATION_7DAYS_MS),
  }))

  const res = await prisma.roomInvite.createMany({
    data: mapData,
  })
  return res
}
