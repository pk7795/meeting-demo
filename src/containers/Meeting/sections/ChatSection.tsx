'use client'

import { MeetingParticipant, useCurrentParticipant, useMeetingMessages, useMeetingParticipantsList } from '../contexts'
import { Avatar, Collapse, Form, Input } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import { SendIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { css } from '@emotion/css'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon } from '@/components'
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

  // TODO: add type
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

  const classNameCollapse = css({
    '.ant-collapse-header': {
      paddingTop: '0px !important',
      paddingBottom: '0px !important',
      height: 64,
      alignItems: 'center !important',
      borderRadius: '0px !important',
    },
    '.ant-collapse-content': {
      borderRadius: '0px !important',
      border: 'none !important',
    },
    '.ant-collapse-content-box': {
      padding: '0px !important',
    },
  })

  return (
    <div className="flex flex-col h-full">
      <Collapse
        defaultActiveKey={['2']}
        expandIconPosition="right"
        accordion
        className={classNames('border-none rounded-none flex-1', classNameCollapse)}
      >
        <Collapse.Panel
          header={<div className="text-lg text-[#6B7280]">Participants ({paticipantsList?.length})</div>}
          key="1"
          className="rounded-none border-none"
        >
          <Scrollbars className="h-[calc(100vh-192px)] dark:bg-[#1D2431] bg-white">
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
        </Collapse.Panel>
        <Collapse.Panel
          header={<div className="text-lg text-[#6B7280]">Chat</div>}
          key="2"
          className="rounded-none border-none"
        >
          <Scrollbars className="h-[calc(100vh-192px)] dark:bg-[#1D2431] bg-white">
            <div className="h-full p-2">
              {map(messages, (message) => (
                <div key={message.id} className="mb-2">
                  <div className="flex items-end">
                    <Avatar size={24} className="mr-2" src={message.participant.user?.image}>
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
            </div>
          </Scrollbars>
        </Collapse.Panel>
      </Collapse>
      <Form form={form} onFinish={onSend}>
        <div className="flex items-center justify-center h-16 border-t dark:border-t-[#232C3C]">
          <div className="flex items-center justify-between w-full px-4">
            <Form.Item className="mb-0 flex-1 mr-2" name="input">
              <Input.TextArea
                ref={refInput}
                autoSize={{
                  maxRows: 1,
                  minRows: 1,
                }}
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
  )
}
