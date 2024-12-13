'use client'

import { UserType } from '../constants'
import {
  useIsConnected,
  useJoinRequest,
  usePendingParticipants,
  useReceiveMessage,
  useRoomSupabaseChannel,
} from '../contexts'
import { ChatSection, PaticipantSection, ToolbarSection, ViewSection } from '../sections'
import { useActions, useSessionState } from '@8xff/atm0s-media-react'
import { Button, Modal, notification, Space } from 'antd'
import { throttle } from 'lodash'
import {
  LayoutGridIcon,
  LayoutPanelLeftIcon,
  Loader2Icon,
  MaximizeIcon,
  MinimizeIcon,
  MoonIcon,
  RefreshCwIcon,
  SunIcon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import useWindowFocus from 'use-window-focus'
import { useTimeout } from 'usehooks-ts'
import { RoomParticipant } from '@prisma/client'
import { ADMIT_RINGTONE, MESSAGE_RINGTONE, ERMIS_LOGO } from '@public'
import { acceptParticipant } from '@/app/actions'
import { ButtonIcon, Drawer, Icon } from '@/components'
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
  const [openPaticipant, setOpenPaticipant] = useState(false)
  const { isMaximize, onOpenFullScreen } = useFullScreen()
  const { isMobile } = useDevice()
  const [theme, setTheme] = useRecoilState(themeState)
  const [joinRequest, clearJoinRequest] = useJoinRequest()
  const [, delPendingParticipant] = usePendingParticipants()
  const roomSupabaseChannel = useRoomSupabaseChannel()
  const isConnected = useIsConnected()
  const admitRingTone = useMemo(() => new Audio(ADMIT_RINGTONE), [])
  const messageRingTone = useMemo(() => new Audio(MESSAGE_RINGTONE), [])
  const windowFocused = useWindowFocus()
  const sessionState = useSessionState()
  const [visibleRefresh, setVisibleRefresh] = useState(false)

  useTimeout(() => setVisibleRefresh(true), 30000)

  useEffect(() => {
    let timeout: any = null
    if (visibleRefresh) {
      clearTimeout(timeout)
      return
    }
    if (
      isConnected === false ||
      sessionState === 'reconnecting' ||
      sessionState === 'disconnected' ||
      sessionState === 'error'
    ) {
      timeout = setTimeout(() => {
        setVisibleRefresh(true)
      }, 10000)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [isConnected, sessionState, visibleRefresh])

  console.log('--------------------------------------------------------')
  console.log('sessionState', sessionState)
  console.log('--------------------------------------------------------')

  const { data: session } = useSession()

  const [receiveMessage, clearReceiveMessage] = useReceiveMessage()

  useEffect(() => {
    if (openChat && windowFocused) {
      clearReceiveMessage()
    }
  }, [clearReceiveMessage, openChat, windowFocused])

  const throttled = useRef(
    throttle(
      () => {
        return messageRingTone.play()
      },
      1000 * 3,
      { trailing: false, leading: true }
    )
  )

  useEffect(() => {
    if (receiveMessage && !openChat) {
      if (receiveMessage?.participant?.user?.id !== session?.user.id) {
        throttled.current()
      }
    }
  }, [session?.user.id, messageRingTone, receiveMessage, openChat, clearReceiveMessage])

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
        duration: 0, // never auto close
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
    admitRingTone.play()
    openNotification({
      message: `A ${type} named '${name}' is requesting to join the room`,
      description: 'Do you want to accept this request?',
      buttons: {
        confirm: 'Accept',
        onConfirm: () => {
          sendAcceptJoinRequest(id, type)
        },
        cancel: 'Reject',
        onCancel: () => {
          delPendingParticipant(id)
        },
      },
      onClose: () => {
        clearJoinRequest()
      },
    })
  }, [admitRingTone, clearJoinRequest, delPendingParticipant, joinRequest, openNotification, sendAcceptJoinRequest])

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
      <Modal
        getContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
        footer={false}
        closable={false}
        open={
          isConnected === false ||
          sessionState === 'reconnecting' ||
          sessionState === 'disconnected' ||
          sessionState === 'error'
        }
      >
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg text-black dark:text-white mb-4">Connecting to Server ...</div>
          <Icon className="rotate-center text-black dark:text-white" icon={<Loader2Icon />} />
          {visibleRefresh && (
            <ButtonIcon
              onClick={() => window.location.reload()}
              type="primary"
              className="mt-4"
              icon={<RefreshCwIcon size={16} className="" />}
            >
              Refresh
            </ButtonIcon>
          )}
        </div>
      </Modal>
      {contextHolder}
      <div className="bg-[#F9FAFB] dark:bg-dark_ebony h-screen" id="id--fullScreen">
        <div className="h-full flex items-center">
          <div className="flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between border-b dark:border-b-[#232C3C] h-16 px-4 bg-white dark:bg-[#17202E]">
              <Space>
                <Link href="/">
                  <img src={theme === 'dark' ? ERMIS_LOGO : ERMIS_LOGO} alt="" className="h-8" />
                </Link>
                <div className="pl-2">
                  <div className="dark:text-gray-100 text-xl font-semibold">{room.name}</div>
                </div>
              </Space>
              <Space>
                <ButtonIcon
                  className="hidden lg:flex"
                  onClick={() => setLayout('GRID')}
                  icon={<LayoutGridIcon size={16} color={layout === 'GRID' ? '#2D8CFF' : '#9ca3af'} />}
                />
                <ButtonIcon
                  className="hidden lg:flex"
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
                  className="hidden lg:flex"
                />
                <ButtonIcon
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  shape="circle"
                  icon={theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} color="#000" />}
                />
              </Space>
            </div>
            <ViewSection layout={layout} setLayout={setLayout} />
            <ToolbarSection
              sendEvent={sendRoomEvent}
              openChat={openChat}
              setOpenChat={setOpenChat}
              openPaticipant={openPaticipant}
              setOpenPaticipant={setOpenPaticipant}
            />
          </div>
          {!isMobile ? (
            <>
              {openChat && (
                <div className="w-80 h-full dark:bg-[#17202E] bg-[#F9FAFB] border-l dark:border-l-[#232C3C]">
                  <ChatSection room={room} onClose={() => setOpenChat(false)} />
                </div>
              )}
              {openPaticipant && (
                <div className="w-80 h-full dark:bg-[#17202E] bg-[#F9FAFB] border-l dark:border-l-[#232C3C]">
                  <PaticipantSection
                    room={room}
                    onClose={() => setOpenPaticipant(false)}
                    sendAcceptJoinRequest={sendAcceptJoinRequest}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <Drawer open={openChat} headerStyle={{ display: 'none' }} bodyStyle={{ padding: 0 }}>
                <ChatSection room={room} onClose={() => setOpenChat(false)} />
              </Drawer>
              <Drawer open={openPaticipant} headerStyle={{ display: 'none' }} bodyStyle={{ padding: 0 }}>
                <PaticipantSection
                  room={room}
                  onClose={() => setOpenPaticipant(false)}
                  sendAcceptJoinRequest={sendAcceptJoinRequest}
                />
              </Drawer>
            </>
          )}
        </div>
      </div>
    </>
  )
}
