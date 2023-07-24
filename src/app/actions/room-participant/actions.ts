'use server'

import { env, getPrisma, getSessionUser } from '@/lib'
import { createLiveWebrtcToken } from '@/lib/bluesea'

export async function createRoomParticipantLoginUser({ data }: { data: { passcode: string } }) {
  const prisma = getPrisma()
  const session = await getSessionUser()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const room = await prisma.room.findFirst({
    where: {
      passcode: data?.passcode,
    },
  })

  if (!room) {
    throw new Error('RoomNotFound')
  }

  let roomParticipant = await prisma.roomParticipant.findFirst({
    where: {
      userId: session.id,
      roomId: room.id,
    },
    include: {
      user: true,
    },
  })

  if (!roomParticipant) {
    roomParticipant = await prisma.roomParticipant.create({
      data: {
        name: session.name,
        roomId: room.id as string,
        userId: session.id,
      },
      include: {
        user: true,
      },
    })
  }

  const peer = roomParticipant.id
  const token = await createLiveWebrtcToken(room.id, peer, env.BLUESEA_CONFIG, false)
  const blueseaConfig = {
    room: room.id,
    peer,
    gateway: env.BLUESEA_CONFIG.gateway,
    token: token,
  }
  return {
    blueseaConfig,
    roomParticipant,
  }
}

export async function createRoomParticipantGuestUser({ data }: { data: { name: string; passcode: string } }) {
  const prisma = getPrisma()

  const room = await prisma.room.findFirst({
    where: {
      passcode: data?.passcode,
    },
  })

  if (!room) {
    throw new Error('RoomNotFound')
  }

  const roomParticipant = await prisma.roomParticipant.create({
    data: {
      name: data.name,
      roomId: room.id as string,
    },
  })

  const peer = roomParticipant.id
  const token = await createLiveWebrtcToken(room.id, peer, env.BLUESEA_CONFIG, false)
  const blueseaConfig = {
    room: room.id,
    peer,
    gateway: env.BLUESEA_CONFIG.gateway,
    token: token,
  }
  return {
    blueseaConfig,
    roomParticipant,
  }
}
