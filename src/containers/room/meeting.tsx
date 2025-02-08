'use client'

import { AudioMixerPlayer, PeerLocal, PeerRemote } from '@/components'
import { Button } from '@/components/ui/button'
import { peerPinnedAtom } from '@/jotai/peer'
import { ADMIT_RINGTONE, MESSAGE_RINGTONE } from '@/public'
import { RoomStore } from '@/stores/room'
import { RoomPopulated } from '@/types/types'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks'
import { RoomParticipant } from '@prisma/client'
import { useMouse } from '@uidotdev/usehooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { filter, find, map } from 'lodash'
import { CopyIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { BottomBarV2, GridViewLayout, Header, SidebarViewLayout } from './components'

type Props = {
  host: string | null
  roomParticipant: RoomPopulated
  myParticipant: RoomParticipant | null
}

export const Meeting: React.FC<Props> = ({ host, myParticipant, roomParticipant }) => {
  const params = useParams()
  const room = useRoom()
  const remotePeers = useRemotePeers()
  const meetingLink = `https://${host}/${params?.room}`
  const [, onCopy] = useCopyToClipboard()
  const [isCreateNewRoom, setIsCreateNewRoom] = useState(true)
  const [mouse, containerRef] = useMouse<any>()
  const { data: session } = useSession()
  const user = session?.user
  const addListUserToRoom = useSetAtom(RoomStore.addListUserToRoom)
  const widthContent = containerRef?.current?.clientWidth
  const heightContent = containerRef?.current?.clientHeight
  const peerPinned = useAtomValue(peerPinnedAtom)

  // const [joinRequest, clearJoinRequest] = useJoinRequest()

  // const [pendingParticipants, delPendingParticipant] = usePendingParticipants()

  // const roomSupabaseChannel = useRoomSupabaseChannel()
  const admitRingTone = useMemo(() => new Audio(ADMIT_RINGTONE), [])
  const messageRingTone = useMemo(() => new Audio(MESSAGE_RINGTONE), [])
  const checkPeerPinned = useMemo(() => {
    if (peerPinned?.peer === room?.peer) return { check: true, peer: 'local', peerItem: room }
    const findRemotePeer = find(remotePeers, (peer) => peer.peer === peerPinned?.peer)
    return findRemotePeer
      ? { check: true, peer: 'remote', peerItem: findRemotePeer }
      : { check: false, peer: null, peerItem: null }
  }, [peerPinned?.peer, room, remotePeers])

  const isHoverContent =
    mouse.elementX > 0 && mouse.elementX <= widthContent && mouse.elementY > 0 && mouse.elementY <= heightContent

  const onCopyInviteLink = () => {
    onCopy(meetingLink as string).then(() => {
      toast.success('Copied invite link', { duration: 2000 })
    })
  }
  // const sendAcceptJoinRequest = useCallback(
  //   (id: string, type: UserType) => {
  //     console.log(`${id}:room:${roomParticipant.id}`)

  //     if (type === UserType.User) {
  //       acceptParticipant(id)
  //     }

  //     const channel = supabase.channel(`${id}:room:${roomParticipant.id}`)
  //     channel.subscribe((status) => {
  //       if (status === 'SUBSCRIBED') {
  //         channel.send({
  //           type: 'broadcast',
  //           event: 'accepted',
  //           payload: { token: 'aaaaaa' },
  //         })
  //         delPendingParticipant(id)
  //       }
  //     })
  //   },
  //   [delPendingParticipant, roomParticipant.id]
  // )

  // useEffect(() => {
  //   console.log('joinRequest', joinRequest);

  //   if (!joinRequest) return
  //   const { id, name, type } = joinRequest

  //   toast.success("hahahahaha", { duration: 2000 })
  //   admitRingTone.play()
  //   // openNotification({
  //   //   message: `A ${type} named '${name}' is requesting to join the room`,
  //   //   description: 'Do you want to accept this request?',
  //   //   buttons: {
  //   //     confirm: 'Accept',
  //   //     onConfirm: () => {
  //   //       sendAcceptJoinRequest(id, type)
  //   //     },
  //   //     cancel: 'Reject',
  //   //     onCancel: () => {
  //   //       delPendingParticipant(id)
  //   //     },
  //   //   },
  //   //   onClose: () => {
  //   //     clearJoinRequest()
  //   //   },
  //   // })
  // }, [admitRingTone, clearJoinRequest, delPendingParticipant, joinRequest, toast, sendAcceptJoinRequest])

  //end  accept join request

  //? move participant to meetingProvider
  const peerLocal = useMemo(() => <PeerLocal userName={myParticipant?.name} />, [])

  const mainPeerScreen = useMemo(() => {
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peer: any = checkPeerPinned.peerItem
      return <PeerRemote peer={peer} userName={myParticipant?.name} />
    }
    return peerLocal
  }, [checkPeerPinned, peerLocal])

  const filterRemotePeers = useMemo(() => filter(remotePeers, (p) => p.peer != room?.peer), [remotePeers, room?.peer])

  const peerRemoteMixerAudio = useMemo(() => {
    let mapRemotePeers = []
    if (checkPeerPinned.check && checkPeerPinned.peer === 'remote') {
      const peerRemote: any = filter(filterRemotePeers, (p) => p.peer != checkPeerPinned?.peerItem?.peer)
      const peerRemoteScreen = map(peerRemote, (p) => <PeerRemote key={p.peer} peer={p} userName={myParticipant?.name} />)
      mapRemotePeers = [peerLocal, ...peerRemoteScreen]
    } else {
      mapRemotePeers = map(filterRemotePeers, (p) => <PeerRemote key={p.peer} peer={p} userName={myParticipant?.name} />)
    }
    return mapRemotePeers
  }, [checkPeerPinned.check, checkPeerPinned.peer, checkPeerPinned?.peerItem?.peer, filterRemotePeers, peerLocal])

  useEffect(() => {
    addListUserToRoom({
      users: [
        {
          gmail: user?.email ?? '',
          name: user?.name ?? '',
          avatar: user?.image ?? '',
        },
        ...map(remotePeers, (item) => ({ gmail: item.peer, name: item.peer, avatar: '' })),
      ],
      roomCode: (params?.room ?? '') as string,
    })

    return () => {
      addListUserToRoom({
        users: [],
        roomCode: (params?.room ?? '') as string,
      })
    }
  }, [addListUserToRoom, params?.room, remotePeers, user])
  // useEffect(() => {
  //   console.log("Giá trị joinRequest thay đổi:", joinRequest, pendingParticipants);
  //   // Bạn có thể thực hiện xử lý khác ở đây mỗi khi joinRequest cập nhật
  // }, [joinRequest, pendingParticipants]);
  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-start justify-center overflow-hidden bg-foreground px-4 pt-[60px]"
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
      {isHoverContent && <BottomBarV2 />}

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
            <div className="flex h-10 items-center gap-2 rounded bg-zinc-200 pl-3">
              <div className="flex-1 text-sm">{meetingLink}</div>
              <Button variant="link" size="icon" onClick={onCopyInviteLink}>
                <CopyIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
