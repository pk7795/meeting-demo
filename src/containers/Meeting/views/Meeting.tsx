'use client'

import { Actions, ChatLayout, Prepare, ViewGrid, ViewLeft } from '../components'
import { Space } from 'antd'
import {
  BlueseaSessionProvider,
  LogLevel,
  MixMinusMode,
  StreamKinds,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import dayjs from 'dayjs'
import { LayoutGridIcon, LayoutPanelLeftIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { RoomParticipant } from '@prisma/client'
import { LOGO_BLACK_LONG, LOGO_WHITE_LONG } from '@public'
import { ButtonIcon, Drawer } from '@/components'
import { MeetingProvider, useMeetingUserState } from '@/contexts'
import { useDevice } from '@/hooks'
import { BlueseaSession } from '@/lib/bluesea'
import { themeState } from '@/recoil'
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
  const createAudio: [HTMLAudioElement, HTMLAudioElement, HTMLAudioElement] = useMemo(() => {
    const audio1 = document.createElement('audio')
    audio1.id = 'id-audio-1'
    audio1.autoplay = true
    audio1.hidden = false
    const audio2 = document.createElement('audio')
    audio2.id = 'id-audio-2'
    audio2.autoplay = true
    audio2.hidden = false
    const audio3 = document.createElement('audio')
    audio3.id = 'id-audio-3'
    audio3.autoplay = true
    audio3.hidden = false

    return [audio1, audio2, audio3]
  }, [])

  useEffect(() => {
    document.body.appendChild(createAudio[0])
    document.body.appendChild(createAudio[1])
    document.body.appendChild(createAudio[2])
    return () => {
      document.getElementById('id-audio-1')?.remove()
      document.getElementById('id-audio-2')?.remove()
      document.getElementById('id-audio-3')?.remove()
    }
  }, [createAudio])
  return (
    <BlueseaSessionProvider
      logLevel={LogLevel.WARN}
      gateways={bluesea.gateway}
      room={bluesea.room}
      peer={bluesea.peer}
      token={bluesea.token}
      autoConnect={false}
      mixMinusAudio={{ mode: MixMinusMode.AllAudioStreams, elements: createAudio }}
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
  const theme = useRecoilValue(themeState)
  const [date, setDate] = useState(dayjs().format('hh:mm:ss A • ddd, MMM DD'))

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs().format('hh:mm:ss A • ddd, MMM DD'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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
    <div className="bg-[#F9FAFB] dark:bg-dark_ebony h-screen" id="full-screen">
      <div className="h-full flex items-center">
        <div className="flex-1 h-full flex flex-col">
          <div className="flex items-center justify-between border-b dark:border-b-[#232C3C] h-16 px-4 bg-white dark:bg-[#17202E]">
            <Space>
              <Link href="/">
                <img src={theme === 'dark' ? LOGO_WHITE_LONG : LOGO_BLACK_LONG} alt="" className="h-8" />
              </Link>
              <div className="border-l dark:border-l-[#232C3C] ml-6 pl-6">
                <div className="dark:text-gray-100 text-xl font-semibold">{room.name}</div>
                <div className="dark:text-gray-400">{date}</div>
              </div>
            </Space>
            {!isMobile && (
              <Space>
                <ButtonIcon
                  onClick={() => setLayout(Layout.GRID)}
                  icon={<LayoutGridIcon size={16} color={layout === Layout.GRID ? '#2D8CFF' : '#9ca3af'} />}
                />
                <ButtonIcon
                  onClick={() => setLayout(Layout.LEFT)}
                  icon={<LayoutPanelLeftIcon size={16} color={layout === Layout.LEFT ? '#2D8CFF' : '#9ca3af'} />}
                />
                <ButtonIcon
                  onClick={() => onOpenFullScreen()}
                  icon={
                    !isMaximize ? (
                      <MaximizeIcon size={16} color="#9ca3af" />
                    ) : (
                      <MinimizeIcon size={16} color="#9ca3af" />
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
              <div className="w-80 h-full dark:bg-[#17202E] bg-[#F9FAFB] border-l dark:border-l-[#232C3C]">
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
  ) : (
    <Prepare setIsJoined={setIsJoined} name={name} setName={setName} />
  )
}
