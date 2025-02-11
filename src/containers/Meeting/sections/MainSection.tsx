'use client'

import { UserType } from '../constants'
import {
  useIsConnected,
  useJoinRequest,
  useOnlineMeetingParticipantsList,
  usePendingParticipants,
  usePinnedParticipant,
  useReceiveMessage,
  useRoomSupabaseChannel,
} from '../contexts'
import { Button as AntdButton, Modal, notification, Space } from 'antd'
import { find, throttle, filter, map } from 'lodash'
import {
  CopyIcon,
  LayoutGridIcon,
  LayoutPanelLeftIcon,
  Loader2Icon,
  MaximizeIcon,
  MinimizeIcon,
  MoonIcon,
  RefreshCwIcon,
  SunIcon,
  XIcon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import useWindowFocus from 'use-window-focus'
import { useCopyToClipboard, useTimeout } from 'usehooks-ts'
import { RoomParticipant } from '@prisma/client'
import { ADMIT_RINGTONE, MESSAGE_RINGTONE, ERMIS_LOGO, RAISE_HAND_RINGTONE } from '@public'
import { acceptParticipant } from '@/app/actions'
import { ButtonIcon, Drawer, Icon } from '@/components'
import { supabase } from '@/config/supabase'
import { useDevice, useFullScreen } from '@/hooks'
import { themeState } from '@/recoil'
import { RoomPopulated } from '@/types/types'
import { useMouse } from '@uidotdev/usehooks'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { Header } from '../components/header'
import { GridViewLayout } from '../components/grid-view-layout'
import { AudioMixerPlayer } from '@/components/media/audio-mixer'
import { BottomBarV2 } from '../components/bottom-bar-v2'
import { Button } from '@/components/ui/button'
import { SidebarViewLayout } from '../components/sidebar-view-layout'
import { useRemotePeers, useRoom, useSessionStatus } from '@atm0s-media-sdk/react-hooks'
import { PeerLocal, PeerRemote } from '@/components/media'
import { SidebarLayout } from '@/layouts'
import { useChatClientContext } from '@/contexts/chat'
import { useSidebar } from '@/components/ui/sidebar'
type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
}

export const MainSection: React.FC<Props> = ({ room, myParticipant }) => {
  const [api, contextHolder] = notification.useNotification()
  const [layout, setLayout] = useState<'GRID' | 'LEFT'>('GRID')
  const [openChat, setOpenChat] = useState(false)
  const [openParticipant, setOpenParticipant] = useState(false)
  const { isMobile } = useDevice()
  const [theme, setTheme] = useRecoilState(themeState)

  const [joinRequest, clearJoinRequest] = useJoinRequest()
  const [, delPendingParticipant] = usePendingParticipants()
  const roomSupabaseChannel = useRoomSupabaseChannel()
  const isConnected = useIsConnected()
  const admitRingTone = useMemo(() => new Audio(ADMIT_RINGTONE), [])
  const messageRingTone = useMemo(() => new Audio(MESSAGE_RINGTONE), [])
  const raiseRingTone = useMemo(() => new Audio(RAISE_HAND_RINGTONE), [])
  const windowFocused = useWindowFocus()
  const sessionStatus = useSessionStatus()
  const [visibleRefresh, setVisibleRefresh] = useState(false)
  const participants = useOnlineMeetingParticipantsList()

  const { toggleSidebar } = useSidebar()

  //From new meeting
  const params = useParams()
  const [, onCopy] = useCopyToClipboard()
  const [isCreateNewRoom, setIsCreateNewRoom] = useState(true)
  const [mouse, containerRef] = useMouse<any>()
  const widthContent = containerRef?.current?.clientWidth
  const heightContent = containerRef?.current?.clientHeight
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const roomInfo = useRoom()
  const remotePeers = useRemotePeers()

  // const isHoverContent = true
  const isHoverContent =
    mouse.elementX > 0 && mouse.elementX <= widthContent && mouse.elementY > 0 && mouse.elementY <= heightContent
  const baseUrl = window.location.origin
  const meetingLink = `${baseUrl}/${params?.passcode}`

  const onCopyInviteLink = () => {
    onCopy(meetingLink as string).then(() => {
      toast.success('Copied invite link', { duration: 2000 })
    })
  }

  const checkPeerPinned = useMemo(() => {
    if (pinnedParticipant?.p.peer === roomInfo?.peer) return { check: true, peer: 'local', peerItem: roomInfo }
    const findRemotePeer = find(remotePeers, (peer) => peer.peer === pinnedParticipant?.p.peer)
    return findRemotePeer
      ? { check: true, peer: 'remote', peerItem: findRemotePeer }
      : { check: false, peer: null, peerItem: null }
  }, [pinnedParticipant?.p.peer, room, remotePeers])

  const peerLocal = useMemo(() => <PeerLocal userName={myParticipant?.name} />, [])

  const mainPeerScreen = useMemo(() => {
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peer: any = checkPeerPinned.peerItem

      const remoteParticipant = find(participants, (p) => p.id === peer.peer)
      return <PeerRemote peer={peer} participant={remoteParticipant} raiseRingTone={raiseRingTone} />
    }
    return peerLocal
  }, [checkPeerPinned, peerLocal])

  const filterRemotePeers = useMemo(() => {
    const nonLocalPeers = filter(remotePeers, (p) => p.peer != roomInfo?.peer)

    return filter(nonLocalPeers, (peer) =>
      find(participants, participant => participant.id === peer.peer)
    )
  }, [remotePeers, roomInfo?.peer, participants])

  const peerRemoteMixerAudio = useMemo(() => {
    let mapRemotePeers = []
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peerRemote: any = filter(filterRemotePeers, (p) => p.peer != checkPeerPinned?.peerItem?.peer)

      const peerRemoteScreen = map(peerRemote, (p) => {
        const participant = find(participants, (participant) => participant.id === p.peer)
        return <PeerRemote key={p.peer} peer={p} participant={participant} raiseRingTone={raiseRingTone} />
      })
      mapRemotePeers = [peerLocal, ...peerRemoteScreen]
    } else {
      mapRemotePeers = map(filterRemotePeers, (p) => {
        const participant = find(participants, (participant) => participant.id === p.peer)

        return <PeerRemote key={p.peer} peer={p} participant={participant} raiseRingTone={raiseRingTone} />
      })
    }
    return mapRemotePeers
  }, [checkPeerPinned.check, checkPeerPinned.peer, checkPeerPinned?.peerItem?.peer, filterRemotePeers, peerLocal])
  useTimeout(() => setVisibleRefresh(true), 30000)

  useEffect(() => {
    let timeout: any = null
    if (visibleRefresh) {
      clearTimeout(timeout)
      return
    }
    if (
      isConnected === false ||
      sessionStatus === 'reconnecting' ||
      sessionStatus === 'disconnected' ||
      sessionStatus === 'error'
    ) {
      timeout = setTimeout(() => {
        setVisibleRefresh(true)
      }, 10000)
    }
    return () => {
      clearTimeout(timeout)
    }
  }, [isConnected, sessionStatus, visibleRefresh])

  // console.log('--------------------------------------------------------')
  // console.log('sessionStatus', sessionStatus)
  // console.log('--------------------------------------------------------')

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
          <AntdButton
            type="link"
            size="small"
            onClick={() => {
              opts.buttons.onCancel()
              api.destroy(key)
            }}
          >
            {opts.buttons.cancel}
          </AntdButton>
          <AntdButton
            type="primary"
            size="small"
            onClick={() => {
              opts.buttons.onConfirm()
              api.destroy(key)
            }}
          >
            {opts.buttons.confirm}
          </AntdButton>
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
    toast.custom((t) => (
      <div className="flex flex-col gap-4 rounded-lg bg-background p-4 shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            A {type} named <span className="font-semibold">{name}</span> wants to join this meeting
          </p>

        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant={'blue'}
            size={"sm"}
            onClick={() => {
              sendAcceptJoinRequest(id, type)
              toast.dismiss(t)
            }}
          >
            Admit
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              toggleSidebar('participant')
            }}
          >
            View
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
      onAutoClose: () => clearJoinRequest(),
      onDismiss: () => clearJoinRequest(),
      position: 'top-right',
      className: 'join-request-toast'
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
    <SidebarLayout room={room} sendAcceptJoinRequest={sendAcceptJoinRequest}>
      <Modal
        getContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
        footer={false}
        closable={false}
        open={
          isConnected === false ||
          sessionStatus === 'reconnecting' ||
          sessionStatus === 'disconnected' ||
          sessionStatus === 'error'
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
      <div
        ref={containerRef}
        className=" h-full relative flex w-full items-start justify-center overflow-hidden bg-foreground px-4 pt-[60px] rounded-xl" id="id--fullScreen"
      >
        {isHoverContent && <Header meetingLink={meetingLink} />}

        <div className="flex h-full max-h-[calc(100vh-168px)] w-full flex-col">
          {!checkPeerPinned?.check ? (
            <GridViewLayout items={[mainPeerScreen, ...(peerRemoteMixerAudio || [])]} />
          ) : (
            <SidebarViewLayout
              showButtonExpand={isHoverContent}
              mainPeerScreen={mainPeerScreen}
              remotePeerScreens={[...(peerRemoteMixerAudio || [])]}
            />
          )}
          <AudioMixerPlayer />
        </div>
        {isHoverContent && <BottomBarV2 sendEvent={sendRoomEvent} />}

        {isCreateNewRoom && (
          <div className="absolute bottom-24 left-8 z-[2] w-[360px] rounded-xl bg-muted">
            <div className="flex items-center justify-between py-2 pl-4 pr-3">
              <div>Your meeting&apos;s ready</div>
              <Button className={'h-7 w-7'} variant={'ghost'} onClick={() => setIsCreateNewRoom(false)}>
                <XIcon size={16} />
              </Button>
            </div>
            <div className="grid gap-4 px-4 pb-4">
              <div className="text-xs text-muted-foreground">Share this meeting link with others you want in the meeting</div>
              <div className="flex h-10 items-center gap-2 rounded bg-zinc-200 pl-3 boreder border-red-300 dark:border-red-100">
                <div className="flex-1 text-sm">{meetingLink}</div>
                <Button variant="link" size="icon" onClick={onCopyInviteLink}>
                  <CopyIcon size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
