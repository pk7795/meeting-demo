'use client'

import { Actions, ChatLayout, Prepare, ViewGrid, ViewLeft } from '../components'
import { ConfigProvider, Space, theme } from 'antd'
import {
  BlueseaSessionProvider,
  LogLevel,
  MixMinusMode,
  StreamKinds,
  useActions,
  usePublisher,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import { LayoutGridIcon, LayoutPanelTop, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { LOGO_WHITE_LONG } from '@public'
import { ButtonIcon, Drawer } from '@/components'
import { MeetingProvider, useMeetingUserState } from '@/contexts'
import { useDevice } from '@/hooks'
import { RoomPopulated } from '@/types/types'

const GATEWAY_ENDPOINT = 'https://gateway.bluesea.live'

type Props = {
  room: RoomPopulated | null
  participated: boolean
}

enum Layout {
  GRID = 'grid',
  LEFT = 'left',
}

export const MeetingWrapped = ({ room, participated }: Props) => (
  <MeetingProvider room={room}>
    <Meeting room={room} participated={participated} />
  </MeetingProvider>
)

export const Meeting: React.FC<Props> = ({ room }) => {
  const [name, setName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isMaximize, setIsMaximize] = useState(false)
  const [layout, setLayout] = useState<Layout>(Layout.GRID)
  const [openChat, setOpenChat] = useState(false)
  const { isMobile } = useDevice()

  const [, setMeetingUserState] = useMeetingUserState()

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

  const senders = useMemo(() => {
    return [
      { kind: StreamKinds.AUDIO, name: 'audio_main' },
      { kind: StreamKinds.VIDEO, name: 'video_main', simulcast: true },
      { kind: StreamKinds.VIDEO, name: 'video_screen', simulcast: true },
    ]
  }, [])

  return isJoined ? (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="bg-[#101826] h-screen" id="full-screen">
        <div className="h-full flex items-center">
          <div className="flex-1 h-full flex flex-col">
            <BlueseaSessionProvider
              logLevel={LogLevel.DEBUG}
              gateways={GATEWAY_ENDPOINT}
              room="test-12341"
              peer="test-local"
              token="eyJkIjoie1wiZFwiOntcImluZm9cIjp7XCJiaWxsaW5nXCI6e1wic2VydmljZV9pZFwiOjEwMCxcInNpZ25hdHVyZVwiOlwiQUVjQUFBQUFBQUFBTUVVQ0lRQ0xKSkY3MjN3NUNENVdGald1N0VUWWNnX3dXcjJLUGlUMFZLdjgtejR4endJZ051cHM2Nms3M3BRXzBZRTdLLUpOakI1SHJHYWhZNXBtYU00REQ0emVIc3M9XCJ9LFwiY29uc3VtZXJfcm9vdF9wdWJcIjpcInhwdWI2NjFNeU13QXFSYmNGdEU5aFR5UTc5OWlxMXJrR1RUQWF3ZW5paGhERE5qWXgxanJYWmVCWFJrM1hka016Sm1kYWJpR0h0elE1amhXTlBrQW9Uanh3TXpmQzVaSkxBMkZZZEtCWFZLVXdKaVwiLFwiY3JlYXRlZF9hdF91c1wiOjE2ODk5Mjc2MTAxNDgzNDAsXCJpZGVudGl0eVwiOntcImFwcFwiOlwiY2xrYWl3MmdwMDAwcXQxMDF2M3BranU4NlwiLFwib3JnXCI6XCJjbGthaXZsMG0wMDBrdDEwMWZpY2plNGpoXCIsXCJwZWVyXCI6XCJ0ZXN0LWxvY2FsXCIsXCJyb29tXCI6XCJ0ZXN0LTEyMzQxXCIsXCJzZXNzaW9uX2NoaWxkX2lkXCI6MTk5NTQzMTEyM30sXCJsb2dcIjp7XCJldmVudFwiOntcInNlcnZpY2VfaWRcIjoxMDAsXCJzaWduYXR1cmVcIjpcIkFFY0FBQUFBQUFBQU1FVUNJUURqaU5jSE5kcVFuMDlPTUwta2x0aE5jNWJNUnRabnhVT1VMbnlUR3U2dndnSWdBNGdyUGRjZHFKWEVuWjRuRzllNGhua3FsV0d2b2ZzS0FETXlZRXRiMkVBPVwifSxcInN0YXRzXCI6bnVsbH0sXCJyZWNvcmRcIjpudWxsLFwic2Vzc2lvbl9jaGlsZF9pZFwiOjE5OTU0MzExMjMsXCJzdHJlYW1cIjp7XCJhdWRpb19taXhlclwiOmZhbHNlLFwibWF4X2JpdHJhdGVcIjozMDAwMDAwLFwicGxhbl9pZFwiOlwiZGVmYXVsdFwiLFwidmlkZW9fZW5hYmxlXCI6dHJ1ZX19LFwia2V5XCI6XCJ4cHJ2OXdGZmNaeldFdjJ3eHBnc3VaYjJ0c0FzOXNEQUtYc3YxZ0xmNFFmenZQckhLb3VhOWZwb1Q3V21HWlh6ZWlqY0I4c29HdmY1cEE4ZGRQTFZlZkJ5em5wRHI1Q2ptcjdQeW1heGQyYm8xdlFcIn0sXCJlXCI6bnVsbH0iLCJzIjoiQU4xckt2dDdLc3F3MlpCUFZBUDZnR3ZRNTJKNGJkZjQzZ1k3Sm1yMmNoc3VISlFGR0ZNWTZtdHNWdHRwc2NBTU1yM2Fwamt6QlA1Z3N3R244WWdWV2VSdnBvRm1wU0pUaCJ9"
              mixMinusAudio={{ mode: MixMinusMode.AllAudioStreams }}
              senders={senders}
              receivers={{ audio: 5, video: 5 }}
            >
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
                      icon={<LayoutPanelTop size={16} color={layout === Layout.LEFT ? '#fff' : '#525861'} />}
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
                {layout === Layout.LEFT && <ViewLeft />}
              </div>
              <Actions openChat={openChat} setOpenChat={setOpenChat} />
            </BlueseaSessionProvider>
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
