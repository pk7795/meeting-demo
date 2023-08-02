'use client'

import { UserType } from '../constants'
import { useJoinRequest, usePendingParticipants, useRoomSupabaseChannel } from '../contexts'
import { ChatSection, ToolbarSection, ViewSection } from '../sections'
import { Button, notification, Space } from 'antd'
import dayjs from 'dayjs'
import { LayoutGridIcon, LayoutPanelLeftIcon, MaximizeIcon, MinimizeIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { RoomParticipant } from '@prisma/client'
import { LOGO_SHORT } from '@public'
import { acceptParticipant } from '@/app/actions'
import { ButtonIcon, Drawer } from '@/components'
import { supabase } from '@/config/supabase'
import { useDevice, useFullScreen } from '@/hooks'
import { themeState } from '@/recoil'
import { RoomPopulated } from '@/types/types'

type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
}

export const MainSection: React.FC<Props> = ({ room, myParticipant }) => {
  const [api, contextHolder] = notification.useNotification()
  const [layout, setLayout] = useState<'GRID' | 'LEFT'>('GRID')
  const [openChat, setOpenChat] = useState(false)
  const { isMaximize, onOpenFullScreen } = useFullScreen()
  const { isMobile } = useDevice()
  const [theme, setTheme] = useRecoilState(themeState)
  const [date, setDate] = useState(dayjs().format('hh:mm:ss A • ddd, MMM DD'))
  const [joinRequest, clearJoinRequest] = useJoinRequest()
  const [, delPendingParticipant] = usePendingParticipants()
  const roomSupabaseChannel = useRoomSupabaseChannel()

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.remove('light')
      document.body.classList.remove('bg-white')
      document.body.classList.add('dark')
      document.body.classList.add('bg-dark_ebony')
    } else {
      document.body.classList.remove('dark')
      document.body.classList.remove('bg-dark_ebony')
      document.body.classList.add('light')
      document.body.classList.add('bg-white')
    }
  }, [theme])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDate(dayjs().format('hh:mm:ss A • ddd, MMM DD'))
  //   }, 1000)
  //   return () => clearInterval(interval)
  // }, [])

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
      onClose?: () => void
    }) => {
      const key = 'open' + Date.now()
      const btn = (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              opts.buttons.onCancel()
              api.destroy(key)
            }}
          >
            {opts.buttons.cancel}
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              opts.buttons.onConfirm()
              api.destroy(key)
            }}
          >
            {opts.buttons.confirm}
          </Button>
        </Space>
      )
      api.open({
        message: opts.message,
        description: opts.description,
        btn,
        key,
        onClose: opts.onClose,
      })
    },
    [api]
  )

  const sendAcceptJoinRequest = useCallback(
    (id: string, type: UserType) => {
      console.log(`${id}:room:${room.id}`)

      if (type === UserType.User) {
        acceptParticipant(id)
      }

      const channel = supabase.channel(`${id}:room:${room.id}`)
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'accepted',
            payload: { token: 'aaaaaa' },
          })
          delPendingParticipant(id)
        }
      })
    },
    [delPendingParticipant, room.id]
  )

  useEffect(() => {
    if (!joinRequest) return
    const { id, name, type } = joinRequest
    openNotification({
      message: `A ${type} named '${name}' is requesting to join the room`,
      description: 'Do you want to accept this request?',
      buttons: {
        confirm: 'Accept',
        onConfirm: () => {
          sendAcceptJoinRequest(id, type)
        },
        cancel: 'Reject',
        onCancel: () => {},
      },
      onClose: () => {
        clearJoinRequest()
      },
    })
  }, [clearJoinRequest, joinRequest, openNotification, sendAcceptJoinRequest])

  // TODO: Move every send and receive event to hooks
  const sendRoomEvent = useCallback(
    (event: string, data?: any) => {
      roomSupabaseChannel.send({
        type: 'broadcast',
        event,
        payload: {
          participantId: myParticipant?.id,
          data,
        },
      })
    },
    [roomSupabaseChannel, myParticipant?.id]
  )
  return (
    <>
      {contextHolder}
      <div className="bg-[#F9FAFB] dark:bg-dark_ebony h-screen" id="id--fullScreen">
        <div className="h-full flex items-center">
          <div className="flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between border-b dark:border-b-[#232C3C] h-16 px-4 bg-white dark:bg-[#17202E]">
              <Space>
                <Link href="/">
                  <img src={theme === 'dark' ? LOGO_SHORT : LOGO_SHORT} alt="" className="h-8" />
                </Link>
                <div className="pl-2 hidden md:block">
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
                  <ButtonIcon
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    shape="circle"
                    icon={theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} color="#000" />}
                  />
                </Space>
              )}
            </div>
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <ViewSection layout={layout} setLayout={setLayout} />
            </div>
            <ToolbarSection sendEvent={sendRoomEvent} openChat={openChat} setOpenChat={setOpenChat} />
          </div>
          {!isMobile ? (
            <>
              {openChat && (
                <div className="w-80 h-full dark:bg-[#17202E] bg-[#F9FAFB] border-l dark:border-l-[#232C3C]">
                  <ChatSection room={room} sendAcceptJoinRequest={sendAcceptJoinRequest} />
                </div>
              )}
            </>
          ) : (
            <Drawer open={openChat} onClose={() => setOpenChat(false)} bodyStyle={{ padding: 0 }}>
              <ChatSection room={room} sendAcceptJoinRequest={sendAcceptJoinRequest} />
            </Drawer>
          )}
        </div>
      </div>
    </>
  )
}
