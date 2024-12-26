'use client'

import { useChatChannelContext, useChatClientContext, useCurrentParticipant, useMeetingMessages } from '../contexts'
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
import { useChatClient } from '@/hooks/common/useChatClient'
import { Message } from 'ermis-chat-js-sdk'
type Props = {
  room: Partial<Room> | null
  onClose: () => void
}

export const ChatSection: React.FC<Props> = ({ room, onClose }) => {
  const ref = useRef<Scrollbars>(null)
  const refInput = useRef<any>(null)
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  // const messages = useMeetingMessages()
  const currentParticipant = useCurrentParticipant()
  // useEffect(() => {
  //   ref.current?.scrollToBottom()
  // }, [data, messages])
  const chatClient = useChatClientContext()
  console.log("chatClient: ", chatClient);

  const channel = useChatChannelContext();

  const onSend = useCallback(
    (values: { input: string }) => {
      if (!values?.input) return
      createMessage({
        data: {
          content: values?.input,
          roomId: room!.id!,
          participantId: currentParticipant.id,
        },
      }).then(() => {
        form.setFieldValue('input', '')
        refInput.current?.focus()
      })
    },
    [currentParticipant.id, form, room]
  )

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
              {/* <div className="flex items-end">
                <Avatar className="mr-2" src={message.participant.user?.image}>
                  {message.participant.name?.charAt(0)}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#F87171]">{message.participant.name}</div>
                    <Tooltip title={dayjs(message.createdAt).format('DD/MM/YYYY hh:mm a')}>
                      <div className="ml-2 text-[9px] text-gray-400">{formatDateChat(message.createdAt)}</div>
                    </Tooltip>
                  </div>
                  <div
                    className="text-sm text-gray-400 p-2 rounded-lg bg-gray-200 dark:bg-dark_ebony whitespace-pre-wrap w-fit"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              </div> */}
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
