'use client'

import { BottomBar } from '../components'
import { filter, find, map } from 'lodash'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks'
import { AudioMixerPlayer, PeerLocal, PeerRemoteMixerAudio, useDeviceStream } from '@atm0s-media-sdk/react-ui/lib'
import { GridViewLayout } from '@/app/[room]/containers/grid-view-layout'
import { SidebarViewLayout } from '@/app/[room]/containers/sidebar-view-layout'

type Props = {
  host: string | null
}

export const Meeting: React.FC<Props> = ({ host }) => {
  const params = useParams()
  const room = useRoom()
  const remote_peers = useRemotePeers()
  const stream_video_screen = useDeviceStream('video_screen')
  const meetingLink = `${host}/invite/${params?.room}`

  const [videoScreen, setVideoScreen] = useState<any>()
  const peerLocal = useMemo(
    () => <PeerLocal source_name="video_main" stream_video_screen={stream_video_screen} />,
    [stream_video_screen]
  )

  const peerScreenShare = useMemo(() => {
    if(!videoScreen) return peerLocal
    const findScreenShare:any = find(remote_peers, (p:any) => p.peer === videoScreen?.peer)
    return  <PeerRemoteMixerAudio peer={findScreenShare} />

  }, [peerLocal, remote_peers, videoScreen])

  const peerRemoteMixerAudio = useMemo(() => {
    const filterRemotePeers = filter(remote_peers, (p) => p.peer != room?.peer)
    const mapRemotePeers = map(
      filterRemotePeers,
      (p) => <PeerRemoteMixerAudio key={p.peer} peer={p} setVideoScreen={setVideoScreen}/>
    )

    if (videoScreen) return [peerLocal,...mapRemotePeers]

    return mapRemotePeers

  }, [peerLocal, remote_peers, room?.peer, videoScreen])

  return (
    <div className="w-full h-full flex flex-col">
      {stream_video_screen || videoScreen ? (
        <SidebarViewLayout items={[peerScreenShare,...(peerRemoteMixerAudio || [])]} renderItem={(i) => i} />
      ) : (
        <GridViewLayout items={[peerLocal, ...(peerRemoteMixerAudio || [])]} renderItem={(i) => i} />
      )}
      <AudioMixerPlayer />
      <BottomBar meetingLink={meetingLink} />
    </div>
  )
}
