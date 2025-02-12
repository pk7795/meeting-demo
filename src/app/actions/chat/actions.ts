'use server'

import { MessageInput } from './types'
import { getPrisma } from '@/lib'

export async function getChatChannelByRoomId(roomId: string) {
  // Check existing channel
  const prisma = getPrisma()
  const existingChannel = await prisma.chatChannel.findUnique({
    where: { roomId }
  });

  if (existingChannel) {
    return {
      channelId: existingChannel.channelId,
      channelType: existingChannel.channelType,
      isNew: false
    };
  }

  return { isNew: true };
}
export async function createChatChannel(roomId: string, channelId: string, channelType: string) {
  const prisma = getPrisma();
  return await prisma.chatChannel.create({
    data: {
      channelId,
      roomId,
      channelType
    }
  });
}
export async function getChatUserList() {
  const prisma = getPrisma()
  return await prisma.chatToken.findMany({
    select: {
      userId: true,
      gUserId: true
    }
  })
}
export async function getChatUser(userId: string) {
  const prisma = getPrisma()
  return await prisma.chatToken.findFirst({
    where: {
      gUserId: userId
    },
    select: {
      userId: true,
      gUserId: true
    }
  })
}