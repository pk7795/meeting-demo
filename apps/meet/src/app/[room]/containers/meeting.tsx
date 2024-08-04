'use client'

import { BottomBar } from '../components'
import { filter, map, round } from 'lodash'
import { useParams } from 'next/navigation'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks'
import { AudioMixerPlayer, PeerLocal, PeerRemoteMixerAudio, useDeviceStream } from '@atm0s-media-sdk/react-ui/lib'
import { cn } from '@atm0s-media-sdk/ui/lib/utils'
import { css } from '@emotion/css'

type Props = {
  host: string | null
}

export const Meeting: React.FC<Props> = ({ host }) => {
  const params = useParams()
  const room = useRoom()
  const remote_peers = useRemotePeers()
  const stream_video_screen = useDeviceStream('video_screen')
  const peers_length = remote_peers.length
  const shape = round(Math.sqrt(peers_length))
  let calc_cols = 1
  let calc_rows = 1
  if (!stream_video_screen && peers_length === 2) {
    calc_cols = 2
    calc_rows = 1
  }
  if (!stream_video_screen && peers_length > 2) {
    calc_cols = shape
    calc_rows = shape
  }

  const meetingLink = `${host}/invite/${params?.room}`

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className={cn(
          'w-full h-[calc(100vh-65px)] overflow-y-auto bg-zinc-950 p-4 gap-4 grid relative',
          css({
            gridTemplateColumns: `repeat(${calc_cols}, 1fr)`,
            gridTemplateRows: `repeat(${calc_rows + (peers_length > 4 ? 1 : 0)}, 1fr)`,
          })
        )}
      >
        <PeerLocal source_name="video_main" stream_video_screen={stream_video_screen} />
        {!stream_video_screen &&
          map(
            filter(remote_peers, (p) => p.peer != room?.peer),
            (p) => (
              <div key={p.peer}>
                <PeerRemoteMixerAudio peer={p} />
              </div>
            )
          )}
      </div>
      <AudioMixerPlayer />
      <BottomBar meetingLink={meetingLink} />
    </div>
  )
}
