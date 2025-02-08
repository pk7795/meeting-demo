import { VideoRemote } from './video-remote'
import { Button } from '@/components/ui/button'
import { usePinnedParticipant } from '@/containers/Meeting/contexts'
import { useAudioMixerSpeaking } from '@/hooks'
import { cn } from '@/lib/utils'
import { RemotePeer, RemoteTrack, useRemoteVideoTracks } from '@atm0s-media-sdk/react-hooks'
import { find, isEmpty } from 'lodash'
import { Pin, PinOff } from 'lucide-react'

type Props = {
  peer: RemotePeer
  userName: string | undefined
}

export const PeerRemote: React.FC<Props> = ({ peer, userName }) => {

  const remote_videos = useRemoteVideoTracks(peer.peer)
  const { speaking } = useAudioMixerSpeaking(peer.peer)
  const video_main = find(remote_videos, (t) => t.track === 'video_main')
  const video_screen = find(remote_videos, (t) => t.track === 'video_screen')
  const [pinnedPaticipant, setPinnedParticipant] = usePinnedParticipant()
  const isPinned = pinnedPaticipant?.p.peer === peer?.peer
  const onPin = () => {
    setPinnedParticipant(isPinned ? null : { p: peer, force: true, name: userName })
  }

  return (
    <div
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-800', {
        'ring-4 ring-green-500 ring-opacity-70': speaking,
      })}
    >
      <Button
        onClick={onPin}
        variant={!isPinned ? 'outline' : 'blue'}
        size="icon"
        className={'absolute right-2 top-2 z-[2] h-7 w-7 text-foreground'}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </Button>

      <div className="absolute bottom-3 left-2 z-[1] flex items-center gap-1">
        <div className="truncate rounded-full bg-slate-950 bg-opacity-30 px-2 py-0.5 text-sm text-white">
          {userName || peer.peer} {video_screen && <div>, presenting</div>}
        </div>
      </div>
      {!isEmpty(remote_videos) ? (
        <>
          {video_screen ? (
            <VideoRemote key={video_screen?.track} track={video_screen as RemoteTrack} mirror={false} />
          ) : (
            <VideoRemote key={video_main?.track} track={video_main as RemoteTrack} />
          )}
        </>
      ) : (
        <div className="flex aspect-square max-h-40 w-1/3 max-w-40 items-center justify-center rounded-full bg-zinc-500 text-[calc(200%)] uppercase text-white">
          {userName?.[0]}
        </div>
      )
      }
    </div >
  )
}
