'use client'

import { Actions, ChatLayout, Prepare } from '../components'
import { Space } from 'antd'
import classNames from 'classnames'
import { map, times } from 'lodash'
import { LayoutGridIcon, LayoutPanelTop, MaximizeIcon, MicIcon, MicOffIcon, RadioIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { LOGO_WHITE_LONG } from '@public'
import { IconPlayerRecordFilled } from '@tabler/icons-react'
import { OneUserInvite } from '@/app/meeting/[passcode]/page'
import { ButtonIcon, Icon } from '@/components'

type Props = {
    userInvite: OneUserInvite[]
}

export const Meeting: React.FC<Props> = ({ userInvite }) => {
    const [name, setName] = useState('')
    const [isJoined, setIsJoined] = useState(true)
    return isJoined ? (
        <div className="bg-[#101826] h-screen">
            <div className="h-full flex items-center">
                <div className="flex-1 h-full flex flex-col w-[calc(100vw-420px)]">
                    <div className="flex items-center justify-between border-b border-b-[#232C3C] h-16 px-4 bg-[#17202E]">
                        <Link href="/">
                            <img src={LOGO_WHITE_LONG} alt="" className="h-8" />
                        </Link>
                        <Space>
                            <ButtonIcon icon={<LayoutGridIcon size={16} color="#FFFFFF" />} />
                            <ButtonIcon icon={<LayoutPanelTop size={16} color="#525861" />} />
                            <ButtonIcon icon={<MaximizeIcon size={16} color="#525861" />} />
                        </Space>
                        <Space>
                            <div className="border border-[#3A4250] bg-[#28303E] rounded-lg flex items-center px-4 h-8">
                                <Icon
                                    className="mr-2"
                                    icon={<IconPlayerRecordFilled size={16} className="text-red-500" />}
                                />
                                <span className="text-white">13:03:34</span>
                            </div>
                        </Space>
                    </div>
                    <div className="flex-1 flex flex-col w-full">
                        <div className="flex-1 p-4 pb-0">
                            <div className="relative h-full">
                                <div className="bg-black w-full h-full rounded-lg" />
                                <div className="absolute bottom-4 left-2 px-3 py-1 text-white bg-black bg-opacity-30">
                                    Cao Havan
                                </div>
                                <div className="absolute bottom-4 right-2 w-8 h-8 flex items-center justify-center text-white bg-black bg-opacity-30">
                                    <Icon icon={<RadioIcon size={16} />} />
                                </div>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="p-4 overflow-x-scroll whitespace-nowrap">
                                {map(
                                    map(times(5), (i) => ({
                                        key: i,
                                        name: `Name ${i}`,
                                        mic: true,
                                        camera: true,
                                    })),
                                    (i) => (
                                        <div className="relative w-56 h-32 inline-block ml-4 first:ml-0" key={i?.name}>
                                            <div className="bg-black rounded-lg w-full h-full" />
                                            <div className="absolute bottom-4 left-2 px-3 py-1 text-white bg-black bg-opacity-30">
                                                {i?.name}
                                            </div>
                                            <div
                                                className={classNames(
                                                    'absolute bottom-4 right-2 w-8 h-8 flex items-center justify-center text-white',
                                                    i?.mic ? 'text-white' : 'text-red-500'
                                                )}
                                            >
                                                <Icon
                                                    icon={i?.mic ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                    <Actions userInvite={userInvite} />
                </div>
                <div className="w-full h-full bg-[#17202E] border-l border-l-[#232C3C]">
                    <ChatLayout />
                </div>
            </div>
        </div>
    ) : (
        <Prepare setIsJoined={setIsJoined} name={name} setName={setName} />
    )
}
