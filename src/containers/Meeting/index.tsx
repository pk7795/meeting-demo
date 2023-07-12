'use client'

import { Avatar, Badge, Input, Popover, Space } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
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
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { LOGO_SHORT } from '@public'
import { ButtonIcon, Copy, Icon } from '@/components'
import { MainLayout } from '@/layouts'

type Props = {}

export const Meeting: React.FC<Props> = () => {
  const params = useParams()
  const [mic, setMic] = useState(true)
  const [camera, setCamera] = useState(true)
  const [shareScreen, setShareScreen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [chat, setChat] = useState(true)

  return (
    <MainLayout>
      <div className="bg-white h-full">
        <div className="flex items-center justify-between h-16 px-8 border-b">
          <div className="flex items-center h-full">
            <div className="flex items-center justify-center w-16 h-full border-r mr-4">
              <Link href="/">
                <img src={LOGO_SHORT} alt="" className="h-10" />
              </Link>
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-medium">[Internal] Weekly Report Marketing + Sales</div>
              <div className="text-xs text-[#ACACAC]">June 12th, 2022 | 11:00 AM </div>
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-56px)] bg-[#F1F0F0] flex items-center">
          <div className="flex-1 h-full flex flex-col border-r w-[calc(100vw-420px)]">
            <div className="flex-1 flex flex-col w-full">
              <div className="flex-1 p-8 pb-0">
                <div className="relative h-full">
                  <div className="bg-black w-full h-full rounded-2xl" />
                  <div className="absolute bottom-4 left-2 rounded-full px-3 py-1 text-white bg-black bg-opacity-30">
                    Cao Havan
                  </div>
                  <div className="absolute bottom-4 right-2 rounded-full w-8 h-8 flex items-center justify-center text-white bg-black bg-opacity-30">
                    <Icon icon={<RadioIcon size={16} />} />
                  </div>
                  <ButtonIcon
                    className="absolute top-4 right-2 rounded-full bg-black bg-opacity-30"
                    type="primary"
                    size="large"
                    icon={<MaximizeIcon size={16} color="#fff" />}
                  />
                </div>
              </div>
              <div className="flex">
                <div className="p-8 overflow-x-scroll whitespace-nowrap">
                  {map(
                    [
                      {
                        key: '1',
                        name: 'Name 1',
                        mic: false,
                        camera: true,
                      },
                      {
                        key: '2',
                        name: 'Name 2',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '3',
                        name: 'Name 3',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '4',
                        name: 'Name 4',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '5',
                        name: 'Name 5',
                        mic: true,
                        camera: true,
                      },
                    ],
                    (i) => (
                      <div className="relative w-56 h-32 inline-block ml-4 first:ml-0" key={i?.name}>
                        <div className="bg-black rounded-2xl w-full h-full" />
                        <div className="absolute bottom-4 left-2 rounded-full px-3 py-1 text-white bg-black bg-opacity-30">
                          {i?.name}
                        </div>
                        <div
                          className={classNames(
                            'absolute bottom-4 right-2 rounded-full w-8 h-8 flex items-center justify-center text-white',
                            i?.mic ? 'bg-primary' : 'bg-[#EB5757]'
                          )}
                        >
                          <Icon icon={i?.mic ? <MicIcon size={16} color="#FFF" /> : <MicOffIcon size={16} color="#FFF" />} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center h-24 bg-white">
              <div className="flex items-center justify-between w-full px-6">
                <div className="flex-1 flex items-center justify-center">
                  <Space>
                    <ButtonIcon
                      size="large"
                      type="primary"
                      className={classNames('rounded-full shadow-none', mic ? '' : 'bg-[#EB5757]')}
                      onClick={() => setMic(!mic)}
                      icon={mic ? <MicIcon size={16} color="#FFF" /> : <MicOffIcon size={16} color="#FFF" />}
                      tooltip="Mute/Unmute"
                    />
                    <ButtonIcon
                      size="large"
                      type="primary"
                      className={classNames('rounded-full shadow-none', camera ? '' : 'bg-[#EB5757]')}
                      onClick={() => setCamera(!camera)}
                      icon={<VideoIcon size={16} color="#FFF" />}
                      tooltip="Start/Stop Video"
                    />
                    <ButtonIcon
                      size="large"
                      type="primary"
                      className={classNames(
                        'rounded-full bg-[#DFEBFF] shadow-none',
                        !shareScreen ? '' : 'bg-[#EB5757] bg-opacity-30'
                      )}
                      onClick={() => setShareScreen(!shareScreen)}
                      icon={<ScreenShareIcon size={16} color={!shareScreen ? '#0060FF' : '#EB5757'} />}
                      tooltip="Share Screen"
                    />
                    <ButtonIcon
                      size="large"
                      type="primary"
                      className={classNames(
                        'rounded-full bg-[#DFEBFF] shadow-none',
                        !recording ? '' : 'bg-[#EB5757] bg-opacity-30'
                      )}
                      onClick={() => setRecording(!recording)}
                      icon={<Disc2Icon size={16} color={!recording ? '#0060FF' : '#EB5757'} />}
                      tooltip="Record"
                    />
                    <Badge dot>
                      <ButtonIcon
                        size="large"
                        type="primary"
                        className="rounded-full bg-[#DFEBFF] shadow-none"
                        onClick={() => setChat(!chat)}
                        icon={<MessageCircleIcon size={16} color="#0060FF" />}
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
                        size="large"
                        type="primary"
                        className="rounded-full bg-[#DFEBFF] shadow-none"
                        icon={<MoreHorizontalIcon size={16} color="#0060FF" />}
                      />
                    </Popover>
                  </Space>
                </div>
                <div>
                  <ButtonIcon
                    size="large"
                    type="primary"
                    className="bg-[#EB5757] rounded-full shadow-none text-xs px-6 ml-6"
                  >
                    End Call
                  </ButtonIcon>
                </div>
              </div>
            </div>
          </div>
          {chat && (
            <div className="w-full h-full flex flex-col bg-[#F6F6F6]">
              <div className="flex-1 flex flex-col">
                <div className="px-6 py-3 bg-white">
                  <div className="text-lg font-semibold">Chat</div>
                </div>
                <div className="h-[calc(100vh-204px)] overflow-x-auto px-6 py-3">
                  {map(
                    [
                      {
                        key: '1',
                        name: 'Name 1',
                        mic: false,
                        camera: true,
                      },
                      {
                        key: '2',
                        name: 'Name 2',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '3',
                        name: 'Name 3',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '4',
                        name: 'Name 4',
                        mic: true,
                        camera: true,
                      },
                      {
                        key: '5',
                        name: 'Name 5',
                        mic: true,
                        camera: true,
                      },
                    ],
                    (i) => (
                      <div className="flex items-start mb-2" key={i?.name}>
                        <Avatar>C</Avatar>
                        <div className="bg-white rounded-md p-2 ml-2">
                          <div className="text-xs text-[#AFAFAF]">{i?.name}</div>
                          <div>Good afternoon, everyone.</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center h-24 bg-white">
                <div className="flex items-center justify-between w-full px-6">
                  <Input
                    size="large"
                    className="rounded-full bg-[#F6F6F6] border-none flex-1 mr-2"
                    placeholder="Type something..."
                  />
                  <ButtonIcon size="large" type="primary" className="rounded-full" icon={<SendIcon size={16} />} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
