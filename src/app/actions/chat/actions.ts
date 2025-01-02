'use server'

import { ErmisChat } from 'ermis-chat-js-sdk'
import { MessageInput } from './types'
import { getPrisma } from '@/lib'
import { ErmisChatGenerics } from '@/hooks/common/useChatClient/types'
import { v4 as uuidv4 } from 'uuid'
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
  console.log('--------------------------------------------------------')
  console.log('createMessage start', new Date().getTime())
  console.log('--------------------------------------------------------')
  const prisma = getPrisma()

  const res = await prisma.messages.create({
    data: {
      ...data,
    },
  })
  console.log('--------------------------------------------------------')
  console.log('createMessage end', new Date().getTime())
  console.log('--------------------------------------------------------')
  return res
}

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