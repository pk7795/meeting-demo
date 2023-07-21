'use client'

import { Actions, ChatLayout, Prepare, ViewGrid, ViewLeft } from '../components'
import { ConfigProvider, Space, theme } from 'antd'
import {
  BlueseaSessionProvider,
  LogLevel,
  MixMinusMode,
  StreamKinds,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import { LayoutGridIcon, LayoutPanelLeftIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { RoomParticipant } from '@prisma/client'
import { LOGO_WHITE_LONG } from '@public'
import { ButtonIcon, Drawer } from '@/components'
import { MeetingProvider, useMeetingUserState } from '@/contexts'
import { useDevice } from '@/hooks'
import { BlueseaSession } from '@/lib/bluesea'
import { RoomPopulated } from '@/types/types'

type Props = {
  room: RoomPopulated
  participated: RoomParticipant
  bluesea: BlueseaSession
}

enum Layout {
  GRID = 'grid',
  LEFT = 'left',
}

export const MeetingWrapped = ({ room, participated, bluesea }: Props) => {
  const senders = useMemo(() => {
    return [
      { kind: StreamKinds.AUDIO, name: 'audio_main' },
      { kind: StreamKinds.VIDEO, name: 'video_main', simulcast: true },
      { kind: StreamKinds.VIDEO, name: 'video_screen', simulcast: true },
    ]
  }, [])
  return (
    <BlueseaSessionProvider
      logLevel={LogLevel.WARN}
      gateways={bluesea.gateway}
      room={bluesea.room}
      peer={bluesea.peer}
      token={bluesea.token}
      autoConnect={false}
      mixMinusAudio={{ mode: MixMinusMode.AllAudioStreams }}
      senders={senders}
      receivers={{ audio: 0, video: 5 }}
    >
      <MeetingProvider room={room}>
        <Meeting room={room} participated={participated} />
      </MeetingProvider>
    </BlueseaSessionProvider>
  )
}
export const Meeting: React.FC<Omit<Props, 'bluesea'>> = ({ room }) => {
  const [name, setName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isMaximize, setIsMaximize] = useState(false)
  const [layout, setLayout] = useState<Layout>(Layout.GRID)
  const [openChat, setOpenChat] = useState(false)
  const { isMobile } = useDevice()

  useSharedUserMedia('mic_device')
  useSharedUserMedia('camera_device')

  const [, setMeetingUserState] = useMeetingUserState()

  useEffect(() => {
    if (isMobile) {
      setLayout(Layout.GRID)
    }
  }, [isMobile])

  useEffect(() => {
    if (isJoined) {
      setMeetingUserState({ online: true, joining: 'meeting' })
    } else {
      setMeetingUserState({ online: true, joining: 'prepare-meeting' })
    }
  }, [isJoined, setMeetingUserState])

  const onOpenFullScreen = () => {
    const el = document.getElementById('full-screen')
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsMaximize(false)
      return
    } else {
      el?.requestFullscreen()
      setIsMaximize(true)
    }
  }

  return isJoined ? (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="dark:bg-dark_ebony h-screen" id="full-screen">
        <div className="h-full flex items-center">
          <div className="flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-b-[#232C3C] h-16 px-4 bg-[#17202E]">
              <Link href="/">
                <img src={LOGO_WHITE_LONG} alt="" className="h-8" />
              </Link>
              {!isMobile && (
                <Space>
                  <ButtonIcon
                    onClick={() => setLayout(Layout.GRID)}
                    icon={<LayoutGridIcon size={16} color={layout === Layout.GRID ? '#fff' : '#525861'} />}
                  />
                  <ButtonIcon
                    onClick={() => setLayout(Layout.LEFT)}
                    icon={<LayoutPanelLeftIcon size={16} color={layout === Layout.LEFT ? '#fff' : '#525861'} />}
                  />
                  <ButtonIcon
                    onClick={() => onOpenFullScreen()}
                    icon={
                      !isMaximize ? (
                        <MaximizeIcon size={16} color="#525861" />
                      ) : (
                        <MinimizeIcon size={16} color="#525861" />
                      )
                    }
                    className="__bluesea_video_viewer_fullscreen_button"
                  />
                </Space>
              )}
              {/* TODO: record */}
              {/* <Space>
                <div className="border border-[#3A4250] bg-[#28303E] rounded-lg flex items-center px-4 h-8">
                  <Icon className="mr-2" icon={<IconPlayerRecordFilled size={16} className="text-red-500" />} />
                  <span className="text-white">13:03:34</span>
                </div>
              </Space> */}
            </div>
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              {layout === Layout.GRID && <ViewGrid />}
              {layout === Layout.LEFT && !isMobile && <ViewLeft />}
            </div>
            <Actions openChat={openChat} setOpenChat={setOpenChat} />
          </div>
          {!isMobile ? (
            <>
              {openChat && (
                <div className="w-80 h-full bg-[#17202E] border-l border-l-[#232C3C]">
                  <ChatLayout room={room} />
                </div>
              )}
            </>
          ) : (
            <Drawer open={openChat} onClose={() => setOpenChat(false)} bodyStyle={{ padding: 0 }}>
              <ChatLayout room={room} />
            </Drawer>
          )}
        </div>
      </div>
    </ConfigProvider>
  ) : (
    <Prepare setIsJoined={setIsJoined} name={name} setName={setName} />
  )
}
