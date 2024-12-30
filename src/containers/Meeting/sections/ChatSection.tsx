'use client'

import { useChatClientContext, useCurrentParticipant, useMeetingMessages, useChatChannelContext, useMeetingParticipantsList } from '../contexts'
import { Avatar, Form, Input, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { SendIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon } from '@/components'
import { formatDateChat } from '@/utils'


const mapMessageWithParticipant = (
  message: FormatMessageResponse,
  participants: any[]
) => {
  const userParticipant = participants.find(participant => {
    participant.user
  });

  return {
    ...message,
    user: {
      ...message.user,
      name: userParticipant?.user?.name,
      image: userParticipant?.user?.image,
    }
  };
};

import { FormatMessageResponse } from 'ermis-chat-js-sdk'
type Props = {
  room: Partial<Room> | null
  onClose: () => void
}

export const ChatSection: React.FC<Props> = ({ room, onClose }) => {
  const ref = useRef<Scrollbars>(null)
  const refInput = useRef<any>(null)
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<FormatMessageResponse[]>([])
  const currentParticipant = useCurrentParticipant()
  useEffect(() => {
    ref.current?.scrollToBottom()
  }, [session, messages])
  const chatClient = useChatClientContext();
  const chatChannel = useChatChannelContext();
  const paticipantsList = useMeetingParticipantsList();
  useEffect(() => {

  }, [paticipantsList])

  const onSend = useCallback(
    (values: { input: string }) => {
      if (!values?.input) return
      const payload = { text: values?.input.trim() };
      chatChannel?.sendMessage(payload).then(() => {
        form.setFieldValue('input', '')
        refInput.current?.focus()
      }).catch((error) => {
        console.error('Error: ', error);
      });
    },
    [currentParticipant.id, form, room]
  )
  useEffect(() => {
    if (chatChannel) {
      const channelMessages = chatChannel.state.messages || [];
      setMessages(channelMessages);
    }
  }, [chatChannel]);
  useEffect(() => {
    if (!chatChannel) return;

    const handleNewMessage = (event: any) => {
      setMessages(prevMessages => [...prevMessages, event.message]);
    };

    // Subscribe to new messages
    const listener = chatChannel.on('message.new', handleNewMessage);

    return () => {
      // Cleanup listener
      listener.unsubscribe();
    };
  }, [chatChannel]);
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 border-b dark:border-[#232C3C] flex items-center font-bold px-4 justify-between">
        <span className="dark:text-gray-200 text-gray-900">Chat</span>
        <ButtonIcon icon={<XIcon size={16} />} onClick={onClose} />
      </div>
      <div className="flex flex-col flex-1">
        <Scrollbars ref={ref} className="h-full flex-1 dark:bg-[#1D2431] bg-white">
          {map(messages, (message) => (
            <div key={message.id} className="p-2">
              <div className="flex items-end">
                <Avatar className="mr-2" src={message.user?.avatar}>
                  {message.user?.name?.charAt(0) || message.user?.id.charAt(0)}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#F87171]">{message.user?.name || message.user?.id}</div>
                    <Tooltip title={dayjs(message.created_at).format('DD/MM/YYYY hh:mm a')}>
                      <div className="ml-2 text-[9px] text-gray-400">{formatDateChat(message.created_at)}</div>
                    </Tooltip>
                  </div>
                  <div
                    className="text-sm text-gray-400 p-2 rounded-lg bg-gray-200 dark:bg-dark_ebony whitespace-pre-wrap w-fit"
                    dangerouslySetInnerHTML={{ __html: message.html || message.text || "" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </Scrollbars>
        <Form form={form} onFinish={onSend}>
          <div className="flex items-center justify-center h-16 border-t dark:border-t-[#232C3C]">
            <div className="flex items-center justify-between w-full px-4">
              <Form.Item className="mb-0 flex-1 mr-2" name="input">
                <Input
                  ref={refInput}
                  size="large"
                  className="bg-transparent border-transparent flex-1 text-gray-400 placeholder"
                  placeholder="Type something..."
                />
              </Form.Item>
              <ButtonIcon htmlType="submit" size="large" type="primary" icon={<SendIcon size={16} />} />
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
