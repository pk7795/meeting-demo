'use client'

import { Avatar, Badge, Input, Popover, Space } from 'antd'
import classNames from 'classnames'
import { map, times } from 'lodash'
import {
  CopyIcon,
  Disc2Icon,
  MaximizeIcon,
  MessageCircleIcon,
  MicIcon,
  MicOffIcon,
  MoreHorizontalIcon,
  RadioIcon,
  ScreenShareIcon,
  SendIcon,
  VideoIcon,
  VideoOffIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LOGO_SHORT } from '@public'
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
  const [chat, setChat] = useState(true)

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
    <div className="bg-white h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className="flex items-center h-full">
          <div className="flex items-center justify-center w-16 h-full border-r mr-4">
            <Link href="/">
              <img src={LOGO_SHORT} alt="" className="h-10" />
            </Link>
          </div>
          <div className="flex flex-col">
            <div className="text-lg font-medium">[Internal] Weekly Report Marketing + Sales</div>
            <div className="text-xs text-gray-500">June 12th, 2022 | 11:00 AM </div>
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-64px)] bg-gray-100 flex items-center">
        <div className="flex-1 h-full flex flex-col border-r w-[calc(100vw-420px)]">
          <div className="flex-1 flex flex-col w-full">
            <div className="flex-1 p-4 pb-0">
              <div className="relative h-full">
                <div className="bg-black w-full h-full rounded-lg" />
                <div className="absolute bottom-4 left-2 px-3 py-1 text-white bg-black bg-opacity-30">Cao Havan</div>
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
                        <Icon icon={i?.mic ? <MicIcon size={16} /> : <MicOffIcon size={16} />} />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center h-16 bg-white border-t">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex-1 flex items-center justify-center">
                <Space>
                  <ButtonIcon
                    size="middle"
                    type="primary"
                    className={classNames('shadow-none', mic ? '' : 'bg-red-500')}
                    onClick={() => setMic(!mic)}
                    icon={mic ? <MicIcon size={16} color="#FFF" /> : <MicOffIcon size={16} color="#FFF" />}
                    tooltip="Mute/Unmute"
                  />
                  <ButtonIcon
                    size="middle"
                    type="primary"
                    className={classNames('shadow-none', camera ? '' : 'bg-red-500')}
                    onClick={() => setCamera(!camera)}
                    icon={camera ? <VideoIcon size={16} color="#FFF" /> : <VideoOffIcon size={16} color="#FFF" />}
                    tooltip="Start/Stop Video"
                  />
                  <ButtonIcon
                    size="middle"
                    type="primary"
                    className={classNames('bg-[#DFEBFF] shadow-none', !shareScreen ? '' : 'bg-red-500 bg-opacity-30')}
                    onClick={() => setShareScreen(!shareScreen)}
                    icon={<ScreenShareIcon size={16} color={!shareScreen ? '#3333ff' : '#ef4444'} />}
                    tooltip="Share Screen"
                  />
                  <ButtonIcon
                    size="middle"
                    type="primary"
                    className={classNames('bg-[#DFEBFF] shadow-none', !recording ? '' : 'bg-red-500 bg-opacity-30')}
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
        {chat && (
          <div className="w-full h-full flex flex-col bg-white">
            <div className="flex-1 flex flex-col">
              <div className="px-6 py-3 bg-white border-b">
                <div className="text-lg font-semibold">Chat</div>
              </div>
              <div className="h-[calc(100vh-180px)] overflow-x-auto px-6 py-3">
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
            <div className="flex items-center justify-center h-16 bg-white border-t">
              <div className="flex items-center justify-between w-full px-6">
                <Input className="bg-[#F6F6F6] border-transparent flex-1 mr-2" placeholder="Type something..." />
                <ButtonIcon size="middle" type="primary" icon={<SendIcon size={16} />} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
