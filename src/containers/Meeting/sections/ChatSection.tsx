'use client'

import { useCurrentParticipant, useMeetingParticipantsList, useMeetingParticipants } from '../contexts'
import { Avatar, Form, Input, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { SendIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { ButtonIcon } from '@/components'
import { formatDateChat } from '@/utils'
import { useChatChannelContext, useChatClientContext, useChatMessages } from '@/contexts/chat'
import { MessageAvatar } from '../components/chat/MessageAvatar'

type Props = {
  room: Partial<Room> | null
  onClose: () => void
}

export const ChatSection: React.FC<Props> = ({ room, onClose }) => {
  const ref = useRef<Scrollbars>(null)
  const refInput = useRef<any>(null)
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const messages = useChatMessages();
  const currentParticipant = useCurrentParticipant()
  useEffect(() => {
    ref.current?.scrollToBottom()
  }, [session, messages])
  const chatChannel = useChatChannelContext();

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
  if (!chatChannel) return null;
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 border-b dark:border-[#232C3C] flex items-center font-bold px-4 justify-between">
        <span className="dark:text-gray-200 text-gray-900">Chat</span>
        <ButtonIcon icon={<XIcon size={16} />} onClick={onClose} />
      </div>
      <div className="flex flex-col flex-1">
        <Scrollbars ref={ref} className="h-full flex-1 dark:bg-[#1D2431] bg-white">
          {map(messages, (message) => (
            <MessageAvatar key={message.id} message={message} />
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
