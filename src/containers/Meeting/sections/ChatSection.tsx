'use client'
import { map } from 'lodash'
import { SendIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { useChatChannelContext, useChatMessages, } from '@/contexts/chat'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { MessageAvatar } from '@/components/ui/message-avatar'

type Props = {
  room: Partial<Room> | null
}
type TextInput = {
  message: string
}

export const ChatSection: React.FC<Props> = ({ room }) => {
  const scrollRef = useRef<Scrollbars>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
    reset
  } = useForm<TextInput>()

  const { data: session } = useSession()
  const messages = useChatMessages();


  useEffect(() => {
    scrollRef.current?.scrollToBottom()
  }, [session, messages])
  const chatChannel = useChatChannelContext();
  const { toggleSidebar } = useSidebar()

  const onSend = useCallback(async () => {
    if (!chatChannel) {
      toast.error('Guest users cannot participate in group chat. Please log in to use this feature.')
      reset({ message: '' });
      return;
    }
    setIsSending(true)
    setIsSubmitted(true)
    try {
      if (!getValues('message')) return
      const payload = { text: getValues('message') };
      const message = await chatChannel?.sendMessage(payload)

      reset({ message: '' });
      setIsSending(false)
      setIsSubmitted(false)

    } catch (error) {
      setIsSending(false)
      console.error('Error: ', error);

    } finally {
      setIsSending(false)
    }

  },
    [chatChannel, getValues, reset]
  )

  if (!chatChannel && !room) return null;
  return (
    <div className="flex flex-col h-full ">
      <div className="h-16 border-b dark:border-[#232C3C] flex items-center font-bold px-4 justify-between">
        <span className="dark:text-gray-200 text-gray-900">Chat</span>
        <Button className={'h-7 w-7'} variant={'ghost'} onClick={() => toggleSidebar("chat")} >
          <XIcon size={16} />
        </Button>
      </div>
      <div className="flex flex-col flex-1">
        <Scrollbars ref={scrollRef} className="h-full flex-1 dark:bg-[#11131A] bg-white">
          {map(messages, (message) => (
            <MessageAvatar key={message.id} message={message} />
          ))}
        </Scrollbars>
        <div className="flex items-center justify-center h-24 border-t dark:border-t-[#232C3C]">
          <div className=" items-center justify-between w-full p-4">
            <div className="flex gap-2 ">
              <Input
                id="message"
                placeholder="Type something..."
                type='text'
                className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md line-clamp-2"
                {...register('message', {
                  required: true,
                  validate: {
                    maxLines: (value) => {
                      const lines = value?.split('\n') || [];
                      return lines.length <= 2;
                    }
                  }
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(onSend)();
                  }
                }}
              />
              <Button loading={isSending} type="submit" onClick={handleSubmit(onSend)} variant={'default'} >
                <SendIcon size={16} />
              </Button>
            </div>
            {isSubmitted && errors.message && <span className="text-xs text-red-500">This field is required</span>}

          </div>
        </div>
      </div>
    </div >
  )
}
