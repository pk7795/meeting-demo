'use client'

import { BottomBar } from '../components'
import { filter, map, round } from 'lodash'
import { useParams } from 'next/navigation'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { useRemotePeers, useRoom } from '@atm0s-media-sdk/react-hooks'
import { AudioMixerPlayer, PeerLocal, PeerRemoteMixerAudio, useDeviceStream } from '@atm0s-media-sdk/react-ui/lib'
import { Button } from '@atm0s-media-sdk/ui/components/index'
import { CopyIcon, XIcon } from '@atm0s-media-sdk/ui/icons/index'
import { cn } from '@atm0s-media-sdk/ui/lib/utils'
import { css } from '@emotion/css'
import { isCreateNewRoomState } from '@/recoils'

type Props = {
  host: string | null
}

export const Meeting: React.FC<Props> = ({ host }) => {
  const params = useParams()
  const room = useRoom()
  const [, onCopy] = useCopyToClipboard()
  const [isCreateNewRoom, setIsCreateNewRoom] = useRecoilState(isCreateNewRoomState)
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
        {isCreateNewRoom && (
          <div className="absolute left-4 bottom-4 w-[360px] bg-muted rounded-xl">
            <div className="flex items-center justify-between pl-4 pr-3 py-2">
              <div>Your meeting's ready</div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateNewRoom(false)}>
                <XIcon size={16} />
              </Button>
            </div>
            <div className="px-4 pb-4 grid gap-4">
              <div className="text-muted-foreground text-xs">
                Share this meeting link with others you want in the meeting
              </div>
              <div className="flex items-center gap-2 h-10 bg-zinc-200 rounded pl-3">
                <div className="flex-1 text-sm">{meetingLink}</div>
                <Button
                  variant="link"
                  size="icon"
                  onClick={() => {
                    onCopy(meetingLink as string).then(() => {
                      toast.success('Copied meeting link', { duration: 1500 })
                    })
                  }}
                >
                  <CopyIcon size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <AudioMixerPlayer />
      <BottomBar />
    </div>
  )
}
