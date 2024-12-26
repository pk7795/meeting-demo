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

export async function queryChatChannel(client: ErmisChat<ErmisChatGenerics>, roomId: string) {
  const prisma = getPrisma();
  const chatChannel = await prisma.chatChannel.findFirst({
    where: { roomId }
  });
  console.log("chatChannel: ", chatChannel);

  // if (!chatChannel) {
  //   console.log("Creating new channel");

  //   const uuid = uuidv4();
  //   const projectId = client.projectId;
  //   const channelId = `${projectId}:${uuid}`
  //   const channel = client.channel("team", channelId);
  //   await channel.create();
  //   await prisma.chatChannel.create({
  //     data: {
  //       roomId,
  //       channelId,
  //       channelType: "team"
  //     }
  //   });
  //   return channel;
  // }
  // const channel = client.channel(chatChannel.channelType, chatChannel.channelId);
  // await channel.watch();
  // return channel;
}
