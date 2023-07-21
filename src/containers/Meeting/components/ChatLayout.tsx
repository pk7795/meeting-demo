'use client'

import { Input } from 'antd'
import { map } from 'lodash'
import { SendIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon } from '@/components'
import { useMeetingMessages, useMeetingUsers, useMeetingUsersList } from '@/contexts'
import { formatDateChat } from '@/utils'

type Props = {
  room: Partial<Room> | null
}

export const ChatLayout: React.FC<Props> = ({ room }) => {
  const ref = useRef<Scrollbars>(null)
  const [input, setInput] = useState('')

  const messages = useMeetingMessages()
  const usersList = useMeetingUsersList()
  const users = useMeetingUsers()

  const onSend = useCallback(() => {
    if (!input) return
    createMessage({
      data: {
        content: input,
        roomId: room!.id!,
      },
    }).then(() => {
      setInput('')
      ref.current?.scrollToBottom()
    })
  }, [input, room])

  // TODO: add type
  const renderUserStatus = useCallback((user: any) => {
    if (user.meetingStatus?.online) {
      if (user.meetingStatus?.joining === 'prepare-meeting') {
        return <div className="ml-2 w-1 h-1 rounded-full bg-[#FBBF24]" />
      }
      if (user.meetingStatus?.joining === 'meeting') {
        return <div className="ml-2 w-1 h-1 rounded-full bg-[#10B981]" />
      }
    } else {
      return <div className="ml-2 w-1 h-1 rounded-full bg-[#F87171]" />
    }
  }, [])

  const getMessageUser = useCallback(
    (message: any) => {
      if (message?.user) {
        return message.user
      } else {
        return users.get(message.userId)
      }
    },
    [users]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b border-b-[#232C3C] h-16 px-4 bg-[#1D2431]">
        <div className="text-lg text-[#9CA3AF]">Participants ({usersList?.length})</div>
      </div>
      <div className="p-2 border-b border-b-[#232C3C]">
        {/* List participating user by name and image and active status*/}
        {map(usersList, (user: any) => (
          <div className="flex items-center mb-2 last:mb-0" key={user.id}>
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
            <div className="ml-2 text-[#9CA3AF]">{user.name}</div>
            {renderUserStatus(user)}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center border-b border-b-[#232C3C] h-16 px-4 bg-[#1D2431]">
          <div className="text-lg text-[#9CA3AF]">Chat</div>
        </div>
        <Scrollbars ref={ref}>
          <div className="p-2">
            {messages.map((message: any) => (
              <div key={message.id} className="mb-2">
                <div className="flex items-center">
                  <img src={getMessageUser(message).image} alt="" className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <div className="flex items-center">
                      <div className="text-xs font-bold text-[#F87171]">{getMessageUser(message).name}</div>
                      <div className="ml-2 text-xs text-[#9CA3AF]">{formatDateChat(message.createdAt)}</div>
                    </div>
                    <div className="text-sm text-[#9CA3AF]">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Scrollbars>
      </div>
      <div className="flex items-center justify-center h-16 border-t border-t-[#232C3C]">
        <div className="flex items-center justify-between w-full px-4">
          <Input
            size="large"
            className="bg-transparent border-transparent flex-1 mr-2 text-[#6B7280] placeholder:text-[#6B7280]"
            placeholder="Type something..."
            onPressEnter={onSend}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <ButtonIcon size="large" type="primary" onClick={onSend} icon={<SendIcon size={16} />} />
        </div>
      </div>
    </div>
  )
}
