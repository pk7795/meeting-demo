import { VideoRemote } from './video-remote'
import { Button } from '@/components/ui/button'
import { usePinnedParticipant } from '@/containers/meeting/contexts'
import { useAudioMixerSpeaking } from '@/hooks'
import { cn } from '@/lib/utils'
import { MeetingParticipant } from '@/types/types'
import { RemotePeer, RemoteTrack, useRemoteVideoTracks } from '@atm0s-media-sdk/react-hooks'
import { find, isEmpty, throttle } from 'lodash'
import { Pin, PinOff } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type Props = {
  peer: RemotePeer
  participant: MeetingParticipant
  raiseRingTone: HTMLAudioElement
}

export const PeerRemote: React.FC<Props> = ({ peer, participant, raiseRingTone }) => {

  const remoteVideos = useRemoteVideoTracks(peer.peer)
  const { speaking } = useAudioMixerSpeaking(peer.peer)
  const videoMain = find(remoteVideos, (t) => t.track === 'video_main')
  const videoScreen = find(remoteVideos, (t) => t.track === 'video_screen')
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const isPinned = pinnedParticipant?.p.peer === peer?.peer
  const isHandRaised = participant?.meetingStatus?.handRaised

  const onPin = () => {
    setPinnedParticipant(isPinned ? null : { p: peer, force: true, name: participant?.name })
  }
  const throttled = useRef(
    throttle(
      () => {
        return raiseRingTone.play()
      },
      1000 * 3,
      { trailing: false, leading: true }
    )
  )

  useEffect(() => {
    if (isHandRaised) {
      throttled.current()
    }
  }, [isHandRaised])
  return (
    <div
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-800', {
        'ring-4 ring-green-500 ring-opacity-70': speaking, 'ring-4 ring-yellow-400': isHandRaised
      })}
    >
      <Button
        onClick={onPin}
        variant={!isPinned ? 'outline' : 'blue'}
        size="icon"
        className={'absolute right-2 top-2 z-[2] h-7 w-7 text-background'}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </Button>

      <div className="absolute bottom-3 left-2 z-[1] flex items-center gap-1 jk">
        <div className="truncate rounded-full bg-slate-950 bg-opacity-30 px-2 py-0.5 text-sm text-white text-center flex">
          {participant?.name || peer.peer} {videoScreen && <div>, presenting</div>}
        </div>
      </div>
      {!isEmpty(remoteVideos) ? (
        <>
          {videoScreen ? (
            <VideoRemote key={videoScreen?.track} track={videoScreen as RemoteTrack} mirror={false} />
          ) : (
            <VideoRemote key={videoMain?.track} track={videoMain as RemoteTrack} />
          )}
        </>
      ) : (
        // <div className="flex aspect-square max-h-40 w-1/3 max-w-40 items-center justify-center rounded-full bg-zinc-500 text-[calc(200%)] uppercase text-white">
        //   {participant?.name?.[0]}
        // </div>
        <Avatar className=" max-h-40 w-1/3 max-w-40 aspect-square rounded-full">
          <AvatarImage src={participant.image || ""} alt={participant.name} />
          <AvatarFallback className="rounded-full text-[min(3vw,2rem)]">{participant?.name?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      )
      }
    </div >
  )
}
