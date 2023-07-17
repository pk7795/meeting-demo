'use client'

import { Avatar, Input } from 'antd'
import { map, times } from 'lodash'
import { SendIcon } from 'lucide-react'
import { ButtonIcon } from '@/components'

type Props = {}

export const Chat: React.FC<Props> = () => {
    return (
        <div className="w-full h-full flex flex-col bg-[#17202E] border-l border-l-[#232C3C]">
            <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 bg-[#1B2432]">
                    <div className="text-lg text-[#9CA3AF]">Chat (3)</div>
                </div>
                <div className="h-[calc(100vh-180px)] overflow-x-auto px-4 py-2">
                    {map(
                        map(times(20), (i) => ({
                            key: i,
                            name: `Name ${i}`,
                        })),
                        (i) => (
                            <div className="flex items-start mb-2" key={i?.name}>
                                <Avatar>C</Avatar>
                                <div className="bg-[#DFEBFF] rounded-md p-2 ml-2">
                                    <div className="text-xs text-[#AFAFAF]">{i?.name}</div>
                                    <div>Good afternoon, everyone.</div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className="flex items-center justify-center h-16 border-t border-t-[#232C3C]">
                <div className="flex items-center justify-between w-full px-4">
                    <Input className="bg-[#F6F6F6] border-transparent flex-1 mr-2" placeholder="Type something..." />
                    <ButtonIcon size="middle" type="primary" icon={<SendIcon size={16} />} />
                </div>
            </div>
        </div>
    )
}
