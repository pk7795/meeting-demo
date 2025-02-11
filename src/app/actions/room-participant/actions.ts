'use server'

import { env, getPrisma, getSessionUser } from '@/lib'
import { generateToken, sendEmailRequest } from '@/lib/atm0s'
import { useSession } from 'next-auth/react'


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

  const isOwner = room.ownerId === session.id

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
        accepted: isOwner,
      },
      include: {
        user: true,
      },
    })
  }

  const peer = roomParticipant.id
  const token = await generateToken(room.id, peer, env.GATEWAYS, env.APP_SECRET)
  const peerSession = {
    room: room.id,
    peer,
    gateway: env.GATEWAYS,
    token: token,
  }
  return {
    peerSession,
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
      accepted: true,
    },
  })

  const peer = roomParticipant.id
  const token = await generateToken(room.id, peer, env.GATEWAYS, env.APP_SECRET)
  const peerSession = {
    room: room.id,
    peer,
    gateway: env.GATEWAYS,
    token: token,
  }
  return {
    peerSession,
    roomParticipant,
  }
}

export async function acceptParticipant(participantId: string) {
  const prisma = getPrisma()
  const session = await getSessionUser()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const roomParticipant = await prisma.roomParticipant.findFirst({
    where: {
      id: participantId,
    },
    include: {
      room: true,
    },
  })

  if (!roomParticipant) {
    throw new Error('ParticipantNotFound')
  }

  if (roomParticipant.room.ownerId !== session.id) {
    throw new Error('Unauthorized: Not Owner')
  }

  const updatedRoomParticipant = await prisma.roomParticipant.update({
    where: {
      id: participantId,
    },
    data: {
      accepted: true,
    },
  })

  return updatedRoomParticipant
}

export async function rejectParticipant(participantId: string) {
  const prisma = getPrisma()
  const session = await getSessionUser()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const roomParticipant = await prisma.roomParticipant.findFirst({
    where: {
      id: participantId,
    },
    include: {
      room: true,
    },
  })

  if (!roomParticipant) {
    throw new Error('ParticipantNotFound')
  }

  if (roomParticipant.room.ownerId !== session.id) {
    throw new Error('Unauthorized: Not Owner')
  }

  const updatedRoomParticipant = await prisma.roomParticipant.delete({
    where: {
      id: participantId,
    },
  })

  return updatedRoomParticipant
}
export async function sendInviteMeetingLink({
  data
}: {
  data: {
    email: string;
    senderName: string;
    meetingLink: string;
    accessToken: string
  }
}) {
  try {
    const response = await sendEmailRequest(
      data.email,
      data.senderName,
      data.meetingLink,
      data.accessToken,
      env.ERMIS_CHAT_API
    )

    return response;
  } catch (error) {
    console.error('Failed to send invite:', error);
    throw new Error('Failed to send meeting invite');
  }
}