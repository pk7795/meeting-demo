'use client'

import { MeetingParticipant, useCurrentParticipant, useMeetingMessages, useMeetingParticipantsList } from '../contexts'
import { Avatar, Form, Input } from 'antd'
import { map } from 'lodash'
import { SendIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon, Tabs } from '@/components'
import { formatDateChat } from '@/utils'

type Props = {
  room: Partial<Room> | null
}

export const ChatSection: React.FC<Props> = ({ room }) => {
  const ref = useRef<Scrollbars>(null)
  const refInput = useRef<any>(null)
  const [form] = Form.useForm()

  const messages = useMeetingMessages()
  const paticipantsList = useMeetingParticipantsList()
  const currentParticipant = useCurrentParticipant()
  const [activeKey, setActiveKey] = useState('1')

  useEffect(() => {
    ref.current?.scrollToBottom()
  }, [messages])

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

  const renderUserStatus = useCallback((participant: MeetingParticipant) => {
    if (participant.meetingStatus?.online) {
      if (participant.meetingStatus?.joining === 'prepare-meeting') {
        return '#FBBF24'
      }
      if (participant.meetingStatus?.joining === 'meeting') {
        return '#10B981'
      }
    } else {
      return '#F87171'
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Tabs
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        items={[
          {
            key: '1',
            label: 'Chat',
            children: (
              <div className="flex flex-col h-full">
                <Scrollbars ref={ref} className="h-full flex-1 dark:bg-[#1D2431] bg-white">
                  {map(messages, (message) => (
                    <div key={message.id} className="p-2">
                      <div className="flex items-end">
                        <Avatar className="mr-2" src={message.participant.user?.image}>
                          {message.participant.name?.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-[#F87171]">{message.participant.name}</div>
                            <div className="ml-2 text-[9px] text-[#6B7280]">{formatDateChat(message.createdAt)}</div>
                          </div>
                          <div
                            className="text-sm text-[#6B7280] p-2 rounded-lg bg-gray-200 dark:bg-dark_ebony whitespace-pre-wrap w-fit"
                            dangerouslySetInnerHTML={{ __html: message.content }}
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
                          className="bg-transparent border-transparent flex-1 text-[#6B7280] placeholder:text-[#6B7280]"
                          placeholder="Type something..."
                        />
                      </Form.Item>
                      <ButtonIcon htmlType="submit" size="large" type="primary" icon={<SendIcon size={16} />} />
                    </div>
                  </div>
                </Form>
              </div>
            ),
          },
          {
            key: '2',
            label: `Participants (${paticipantsList?.length})`,
            children: (
              <Scrollbars className="h-full dark:bg-[#1D2431] bg-white">
                <div className="h-full p-2">
                  {map(paticipantsList, (p) => (
                    <div className="flex items-center mb-2 last:mb-0" key={p.id}>
                      <div className="relative">
                        <Avatar src={p.user?.image}>{p.name?.charAt(0)}</Avatar>
                        <div
                          className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                          style={{ backgroundColor: renderUserStatus(p) }}
                        />
                      </div>
                      <div className="ml-2 text-[#6B7280]">{p.name}</div>
                    </div>
                  ))}
                </div>
              </Scrollbars>
            ),
          },
        ]}
      />
    </div>
  )
}
