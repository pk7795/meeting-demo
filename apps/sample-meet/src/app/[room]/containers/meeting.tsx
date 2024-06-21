'use client'

import { BottomBar } from '../components'
import { filter, map, round } from 'lodash'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks/lib'
import { AudioMixerPlayer, PeerLocal, PeerRemoteDirectAudio, PeerRemoteMixerAudio } from '@atm0s-media-sdk/react-ui/lib'
import { cn } from '@atm0s-media-sdk/ui/lib/utils'
import { css } from '@emotion/css'

const audio_direct = false

export const Meeting = () => {
  const room = useRoom()
  const remote_peers = useRemotePeers()
  const peers_length = remote_peers.length
  const shape = round(Math.sqrt(peers_length))
  let calc_cols = 1
  let calc_rows = 1
  if (peers_length === 2) {
    calc_cols = 2
    calc_rows = 1
  }
  if (peers_length > 2) {
    calc_cols = shape
    calc_rows = shape
  }
  return (
    <div className="w-full h-full flex flex-col">
      <div
        className={cn(
          'w-full h-[calc(100vh-65px)] overflow-y-auto bg-zinc-950 p-4 gap-4 grid',
          css({
            gridTemplateColumns: `repeat(${calc_cols}, 1fr)`,
            gridTemplateRows: `repeat(${calc_rows + (peers_length > 4 ? 1 : 0)}, 1fr)`,
          })
        )}
      >
        <PeerLocal source_name="video_main" />
        {map(
          filter(remote_peers, (p) => p.peer != room?.peer),
          (p) => (
            <div>
              {audio_direct ? (
                <PeerRemoteDirectAudio key={p.peer} peer={p} />
              ) : (
                <PeerRemoteMixerAudio key={p.peer} peer={p} />
              )}
            </div>
          )
        )}
      </div>
      {!audio_direct && <AudioMixerPlayer />}
      <BottomBar />
    </div>
  )
}
