'use client'

import { BlueseaSenders, UserType } from '../constants'
import { MediaDeviceProvider, MeetingProvider } from '../contexts'
import { ChatSection, PrepareSection, ToolbarSection, ViewSection } from '../sections'
import { Button, notification, Space } from 'antd'
import {
  BlueseaSessionProvider,
  LogLevel,
  MixMinusMode,
  useSharedDisplayMedia,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import dayjs from 'dayjs'
import { LayoutGridIcon, LayoutPanelLeftIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { RoomParticipant } from '@prisma/client'
import { LOGO_BLACK_LONG, LOGO_WHITE_LONG } from '@public'
import { acceptParticipant } from '@/app/actions'
import { ButtonIcon, Drawer } from '@/components'
import { supabase } from '@/config/supabase'
import { useDevice, useFullScreen } from '@/hooks'
import { BlueseaSession } from '@/lib/bluesea'
import { RoomAccessStatus } from '@/lib/constants'
import { themeState } from '@/recoil'
import { RoomPopulated } from '@/types/types'

type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
}

export const Meeting: React.FC<Props> = ({ room, myParticipant, access }) => {
  const { data } = useSession()
  const [api, contextHolder] = notification.useNotification()
  const [layout, setLayout] = useState<'GRID' | 'LEFT'>('GRID')
  const [openChat, setOpenChat] = useState(false)
  const { isMaximize, onOpenFullScreen } = useFullScreen()
  const { isMobile } = useDevice()
  const theme = useRecoilValue(themeState)
  const [date, setDate] = useState(dayjs().format('hh:mm:ss A • ddd, MMM DD'))
  const [blueseaConfig, setBlueseaConfig] = useState<BlueseaSession>()
  const [roomParticipant, setRoomParticipant] = useState<RoomParticipant | null>(myParticipant)

  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs().format('hh:mm:ss A • ddd, MMM DD'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useSharedUserMedia('mic_device')
  useSharedUserMedia('camera_device')
  useSharedDisplayMedia('screen_device')

  useEffect(() => {}, [])

  const senders = useMemo(() => {
    return [BlueseaSenders.audio, BlueseaSenders.video, BlueseaSenders.screen_audio, BlueseaSenders.screen_video]
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

  const openNotification = useCallback(
    (opts: {
      message: string
      description: string
      buttons: {
        confirm: string
        onConfirm: () => void
        cancel: string
        onCancel: () => void
      }
    }) => {
      const key = 'open' + Date.now()
      const btn = (
        <Space>
          <Button type="link" size="small" onClick={opts.buttons.onCancel}>
            {opts.buttons.cancel}
          </Button>
          <Button type="primary" size="small" onClick={opts.buttons.onConfirm}>
            {opts.buttons.confirm}
          </Button>
        </Space>
      )
      api.open({
        message: opts.message,
        description: opts.description,
        btn,
        key,
      })
    },
    [api]
  )

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

  const sendAcceptJoinRequest = useCallback(
    (id: string, type: UserType) => {
      console.log(`${id}:room:${room.id}`)

      if (type === UserType.User) {
        acceptParticipant(id)
      }

      const channel = supabase.channel(`${id}:room:${room.id}`)
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({ type: 'broadcast', event: 'accepted', payload: { token: 'aaaaaa' } })
        }
      })
    },
    [room.id]
  )

  useEffect(() => {
    if (data?.user.id === room.ownerId) {
      supabase
        .channel(`room:${room.id}`)
        .on('broadcast', { event: 'ask' }, ({ payload }) => {
          const id = payload.id
          const name = payload.name
          const type = payload.type
          openNotification({
            message: `A ${type} named ${name} is requesting to join the room`,
            description: 'Do you want to accept this request?',
            buttons: {
              confirm: 'Accept',
              onConfirm: () => {
                sendAcceptJoinRequest(id, type)
              },
              cancel: 'Reject',
              onCancel: () => {
                api.destroy()
              },
            },
          })
        })
        .subscribe()
    }
  }, [api, data?.user.id, openNotification, room.id, room.ownerId, sendAcceptJoinRequest])

  return (
    <MediaDeviceProvider>
      {contextHolder}
      {blueseaConfig && roomParticipant && joined ? (
        <BlueseaSessionProvider
          logLevel={LogLevel.WARN}
          gateways={blueseaConfig.gateway}
          room={blueseaConfig.room}
          peer={blueseaConfig.peer}
          token={blueseaConfig.token}
          autoConnect={false}
          mixMinusAudio={{ mode: MixMinusMode.AllAudioStreams, elements: createAudio }}
          senders={senders}
          receivers={{ audio: 0, video: 5 }}
        >
          <MeetingProvider room={room} roomParticipant={roomParticipant}>
            <div className="bg-[#F9FAFB] dark:bg-dark_ebony h-screen" id="id--fullScreen">
              <div className="h-full flex items-center">
                <div className="flex-1 h-full flex flex-col">
                  <div className="flex items-center justify-between border-b dark:border-b-[#232C3C] h-16 px-4 bg-white dark:bg-[#17202E]">
                    <Space>
                      <Link href="/">
                        <img src={theme === 'dark' ? LOGO_WHITE_LONG : LOGO_BLACK_LONG} alt="" className="h-8" />
                      </Link>
                      <div className="border-l dark:border-l-[#232C3C] ml-6 pl-6 hidden md:block">
                        <div className="dark:text-gray-100 text-xl font-semibold">{room.name}</div>
                        <div className="dark:text-gray-400">{date}</div>
                      </div>
                    </Space>
                    {!isMobile && (
                      <Space>
                        <ButtonIcon
                          onClick={() => setLayout('GRID')}
                          icon={<LayoutGridIcon size={16} color={layout === 'GRID' ? '#2D8CFF' : '#9ca3af'} />}
                        />
                        <ButtonIcon
                          onClick={() => setLayout('LEFT')}
                          icon={<LayoutPanelLeftIcon size={16} color={layout === 'LEFT' ? '#2D8CFF' : '#9ca3af'} />}
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
                  </div>
                  <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                    <ViewSection layout={layout} setLayout={setLayout} />
                  </div>
                  <ToolbarSection openChat={openChat} setOpenChat={setOpenChat} />
                </div>
                {!isMobile ? (
                  <>
                    {openChat && (
                      <div className="w-80 h-full dark:bg-[#17202E] bg-[#F9FAFB] border-l dark:border-l-[#232C3C]">
                        <ChatSection room={room} />
                      </div>
                    )}
                  </>
                ) : (
                  <Drawer open={openChat} onClose={() => setOpenChat(false)} bodyStyle={{ padding: 0 }}>
                    <ChatSection room={room} />
                  </Drawer>
                )}
              </div>
            </div>
          </MeetingProvider>
        </BlueseaSessionProvider>
      ) : (
        <PrepareSection
          room={room}
          onJoinMeeting={() => {
            setJoined(true)
          }}
          setRoomParticipant={setRoomParticipant}
          setBlueseaConfig={setBlueseaConfig}
          myParticipant={roomParticipant}
          roomAccess={access}
        />
      )}
    </MediaDeviceProvider>
  )
}
