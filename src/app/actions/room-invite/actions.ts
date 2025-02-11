'use server'

import { InviteToRoomInput } from './types'
import { map } from 'lodash'
import { env, getPrisma } from '@/lib'
import { sendEmailRequest } from '@/lib/atm0s'

const DURATION_7DAYS_MS = 1000 * 60 * 60 * 24 * 7

export async function inviteToRoom({ data }: { data: InviteToRoomInput[] }) {
  const prisma = getPrisma()
  const passcode = data[0].passcode
  const room = await prisma.room.findFirst({
    where: {
      passcode,
    },
  })

  const existingInvites = await prisma.roomInvite.findMany({
    where: {
      roomId: room?.id,
      email: {
        in: data.map(d => d.email)
      }
    },
    select: { email: true }
  })

  const existingEmails = new Set(existingInvites.map(invite => invite.email))

  // Filter out existing emails
  const newInvites = data.filter(d => !existingEmails.has(d.email))

  if (newInvites.length > 0) {
    // Create new invites
    const mapData = map(newInvites, (d) => ({
      roomId: room?.id as string,
      email: d.email,
      validUntil: new Date(Date.now() + DURATION_7DAYS_MS),
    }))

    await prisma.roomInvite.createMany({
      data: mapData,
    })
  }

  const emailPromises = data.map(({ email, senderName, accessToken, meetingLink }) =>
    sendEmailRequest(
      email,
      senderName,
      meetingLink,
      accessToken,
      env.ERMIS_CHAT_API
    )
  )

  try {
    await Promise.all(emailPromises)
  } catch (error) {
    console.error('Error sending some emails:', error)
  }

  return {
    success: true,
    newInvites: newInvites.length,
    existingInvites: existingEmails.size,
    totalEmails: data.length
  }
}

