'use client'

import { Input } from 'antd'
import { SendIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ButtonIcon } from '@/components'

const Chat = dynamic(() => import('@/components/Chat'), { ssr: false })

type Props = {}

export const ChatLayout: React.FC<Props> = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 bg-[#1B2432]">
                    <div className="text-lg text-[#9CA3AF]">Chat (3)</div>
                </div>
                <Chat />
            </div>
            <div className="flex items-center justify-center h-16 border-t border-t-[#232C3C]">
                <div className="flex items-center justify-between w-full px-4">
                    <Input
                        size="large"
                        className="bg-transparent border-transparent flex-1 mr-2 text-[#6B7280] placeholder:text-[#6B7280]"
                        placeholder="Type something..."
                    />
                    <ButtonIcon size="large" type="primary" icon={<SendIcon size={16} />} />
                </div>
            </div>
        </div>
    )
}
