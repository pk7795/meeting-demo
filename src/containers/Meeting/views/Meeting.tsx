'use client'

import { Actions, ChatLayout, Prepare, ViewGrid, ViewLeft } from '../components'
import { ConfigProvider, Space, theme } from 'antd'
import { LayoutGridIcon, LayoutPanelTop, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LOGO_WHITE_LONG } from '@public'
import { IconPlayerRecordFilled } from '@tabler/icons-react'
import { OneUserInvite } from '@/app/meeting/[passcode]/page'
import { ButtonIcon, Icon } from '@/components'
import { MeetingProvider, useMeetingUserState } from '@/contexts'
import { RoomPopulated } from '@/types/types'

type Props = {
  userInvite: OneUserInvite[]
  room: RoomPopulated | null
  participated: boolean
}

enum Layout {
  GRID = 'grid',
  LEFT = 'left',
}

export const MeetingWrapped = ({ userInvite, room, participated }: Props) => (
  <MeetingProvider room={room}>
    <Meeting userInvite={userInvite} room={room} participated={participated} />
  </MeetingProvider>
)

export const Meeting: React.FC<Props> = ({ userInvite, room }) => {
  const [name, setName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isMaximize, setIsMaximize] = useState(false)
  const [layout, setLayout] = useState<Layout>(Layout.GRID)
  const [openChat, setOpenChat] = useState(false)

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

  return isJoined ? (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="bg-[#101826] h-screen" id="full-screen">
        <div className="h-full flex items-center">
          <div className="flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-b-[#232C3C] h-16 px-4 bg-[#17202E]">
              <Link href="/">
                <img src={LOGO_WHITE_LONG} alt="" className="h-8" />
              </Link>
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
              <Space>
                <div className="border border-[#3A4250] bg-[#28303E] rounded-lg flex items-center px-4 h-8">
                  <Icon className="mr-2" icon={<IconPlayerRecordFilled size={16} className="text-red-500" />} />
                  <span className="text-white">13:03:34</span>
                </div>
              </Space>
            </div>
            <div className="flex-1 flex flex-col p-4">
              {layout === Layout.GRID && <ViewGrid />}
              {layout === Layout.LEFT && <ViewLeft />}
            </div>
            <Actions userInvite={userInvite} openChat={openChat} setOpenChat={setOpenChat} />
          </div>
          {openChat && (
            <div className="w-80 h-full bg-[#17202E] border-l border-l-[#232C3C]">
              <ChatLayout room={room} />
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  ) : (
    <Prepare setIsJoined={setIsJoined} name={name} setName={setName} />
  )
}
