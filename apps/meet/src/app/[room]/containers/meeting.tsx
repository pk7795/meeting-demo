'use client'

import { BottomBar } from '../components'
import { filter, map } from 'lodash'
import { useParams } from 'next/navigation'
import {  useMemo } from 'react'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks'
import { AudioMixerPlayer, PeerLocal, PeerRemoteMixerAudio, useDeviceStream } from '@atm0s-media-sdk/react-ui/lib'
import { GridViewLayout } from '@/app/[room]/containers/grid-view-layout'

type Props = {
  host: string | null
}

export const Meeting: React.FC<Props> = ({ host }) => {
  const params = useParams()
  const room = useRoom()
  const remote_peers = useRemotePeers()
  const stream_video_screen = useDeviceStream('video_screen')
  const meetingLink = `${host}/invite/${params?.room}`

  const peerLocal = useMemo(
    () => <PeerLocal source_name="video_main" stream_video_screen={stream_video_screen} />,
    [stream_video_screen]
  )

  const peerRemoteMixerAudio = useMemo(() => {
    return (
      !stream_video_screen &&
      map(
        filter(remote_peers, (p) => p.peer != room?.peer),
        (p) => <PeerRemoteMixerAudio key={p.peer} peer={p} />
      )
    )
  }, [remote_peers, room?.peer, stream_video_screen])

  return (
    <div className="w-full h-full flex flex-col">
      <GridViewLayout items={[peerLocal, ...(peerRemoteMixerAudio || [])]} renderItem={(i) => i} />
      <AudioMixerPlayer />
      <BottomBar meetingLink={meetingLink} />
    </div>
  )
}
