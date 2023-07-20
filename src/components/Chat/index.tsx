'use client'

import { useCallback } from 'react'
import { useMeetingUsers } from '@/contexts'
import { formatDateChat } from '@/utils'

// TODO: Types
export default function Chat({ messages }: any) {
  const users = useMeetingUsers()

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
    <div className="flex flex-col flex-1 h-full p-4">
      <div className="flex-1 flex flex-col-reverse overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message: any) => (
            <div key={message.id} className="flex flex-col mb-2">
              <div className="flex items-center">
                <img src={getMessageUser(message).image} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex flex-col">
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
      </div>
    </div>
  )
}
