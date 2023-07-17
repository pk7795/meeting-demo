'use client'

import { Chat } from '../components'
import { Badge, Popover, Space } from 'antd'
import classNames from 'classnames'
import { map, times } from 'lodash'
import {
    CopyIcon,
    Disc2Icon,
    LayoutGridIcon,
    MaximizeIcon,
    MessageCircleIcon,
    MicIcon,
    MicOffIcon,
    MoreHorizontalIcon,
    RadioIcon,
    ScreenShareIcon,
    VideoIcon,
    VideoOffIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LOGO_WHITE_LONG } from '@public'
import { ButtonIcon, Copy, Icon, useApp } from '@/components'

type Props = {}

export const Meeting: React.FC<Props> = () => {
    const { modal } = useApp()
    const router = useRouter()
    const params = useParams()
    const [mic, setMic] = useState(true)
    const [camera, setCamera] = useState(true)
    const [shareScreen, setShareScreen] = useState(false)
    const [recording, setRecording] = useState(false)
    const [chat, setChat] = useState(false)

    const onEndCall = useCallback(() => {
        modal.confirm({
            title: 'Are you sure you want to end this call?',
            okText: 'End Call',
            cancelText: 'Cancel',
            okButtonProps: {
                danger: true,
            },
            onOk: () => {
                router.push('/')
            },
        })
    }, [modal, router])

    return (
        <div className="bg-[#101826] h-screen">
            <div className="h-full flex items-center">
                <div className="flex-1 h-full flex flex-col w-[calc(100vw-420px)]">
                    <div className="flex items-center justify-between border-b border-b-[#232C3C] h-16 px-4 bg-[#17202E]">
                        <Link href="/">
                            <img src={LOGO_WHITE_LONG} alt="" className="h-8" />
                        </Link>
                        <Space>
                            <ButtonIcon icon={<LayoutGridIcon size={16} color="#fff" />} />
                        </Space>
                        <div>
                            <div />
                        </div>
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
                                <ButtonIcon
                                    className="absolute top-4 right-2 bg-black bg-opacity-30"
                                    type="primary"
                                    size="middle"
                                    icon={<MaximizeIcon size={16} color="#fff" />}
                                />
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
                    <div className="flex items-center justify-center h-16 bg-[#17202E] border-t border-t-[#232C3C]">
                        <div className="flex items-center justify-between w-full px-6">
                            <div className="flex-1 flex items-center justify-center">
                                <Space>
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames('shadow-none', mic ? '' : 'bg-red-500')}
                                        onClick={() => setMic(!mic)}
                                        icon={
                                            mic ? (
                                                <MicIcon size={16} color="#FFF" />
                                            ) : (
                                                <MicOffIcon size={16} color="#FFF" />
                                            )
                                        }
                                        tooltip="Mute/Unmute"
                                    />
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames('shadow-none', camera ? '' : 'bg-red-500')}
                                        onClick={() => setCamera(!camera)}
                                        icon={
                                            camera ? (
                                                <VideoIcon size={16} color="#FFF" />
                                            ) : (
                                                <VideoOffIcon size={16} color="#FFF" />
                                            )
                                        }
                                        tooltip="Start/Stop Video"
                                    />
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames(
                                            'bg-[#DFEBFF] shadow-none',
                                            !shareScreen ? '' : 'bg-red-500 bg-opacity-30'
                                        )}
                                        onClick={() => setShareScreen(!shareScreen)}
                                        icon={
                                            <ScreenShareIcon size={16} color={!shareScreen ? '#3333ff' : '#ef4444'} />
                                        }
                                        tooltip="Share Screen"
                                    />
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames(
                                            'bg-[#DFEBFF] shadow-none',
                                            !recording ? '' : 'bg-red-500 bg-opacity-30'
                                        )}
                                        onClick={() => setRecording(!recording)}
                                        icon={<Disc2Icon size={16} color={!recording ? '#3333ff' : '#ef4444'} />}
                                        tooltip="Record"
                                    />
                                    <Badge dot>
                                        <ButtonIcon
                                            size="middle"
                                            type="primary"
                                            className="bg-[#DFEBFF] shadow-none"
                                            onClick={() => setChat(!chat)}
                                            icon={<MessageCircleIcon size={16} color="#3333ff" />}
                                            tooltip="Chat"
                                        />
                                    </Badge>
                                    <Popover
                                        placement="bottomLeft"
                                        overlayInnerStyle={{
                                            padding: 4,
                                        }}
                                        content={
                                            <div>
                                                <Copy text={params?.code as string}>
                                                    <div className="hover:bg-[#ebebef] h-8 px-2 rounded-lg flex items-center cursor-pointer">
                                                        <CopyIcon size={16} />
                                                        <div className="text-sm ml-2">Copy Code</div>
                                                    </div>
                                                </Copy>
                                            </div>
                                        }
                                        trigger="click"
                                    >
                                        <ButtonIcon
                                            size="middle"
                                            type="primary"
                                            className="bg-[#DFEBFF] shadow-none"
                                            icon={<MoreHorizontalIcon size={16} color="#3333ff" />}
                                        />
                                    </Popover>
                                </Space>
                            </div>
                            <div>
                                <ButtonIcon
                                    size="middle"
                                    type="primary"
                                    className="bg-red-500 shadow-none text-xs px-6 ml-6"
                                    onClick={onEndCall}
                                >
                                    End Call
                                </ButtonIcon>
                            </div>
                        </div>
                    </div>
                </div>
                <Chat />
            </div>
        </div>
    )
}
