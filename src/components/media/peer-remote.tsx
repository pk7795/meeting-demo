import { VideoRemote } from '@/components'
import { useAudioMixerSpeaking } from '@/hooks'
import { cn } from '@/lib'
import { RemotePeer, RemoteTrack, useRemoteVideoTracks } from '@atm0s-media-sdk/react-hooks'
import { find, isEmpty } from 'lodash'
import { useEffect } from 'react'

type Props = {
  peer: RemotePeer
  setVideoScreen?: (v: any) => void
}

export const PeerRemote: React.FC<Props> = ({ peer, setVideoScreen }) => {
  const remote_videos = useRemoteVideoTracks(peer.peer)
  console.log('peer', peer)
  const { speaking } = useAudioMixerSpeaking(peer.peer)
  const video_main = find(remote_videos, (t) => t.track === 'video_main')
  const video_screen = find(remote_videos, (t) => t.track === 'video_screen')

  useEffect(() => {
    setVideoScreen?.(video_screen)
  }, [setVideoScreen, video_screen])

  return (
    <div
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-800', {
        'ring-4 ring-green-500 ring-opacity-70': speaking,
      })}
    >
      <div className="absolute bottom-3 left-2 z-[1] flex items-center gap-1">
        <div className="rounded-full bg-slate-950 bg-opacity-30 px-2 py-0.5 text-sm text-white">{peer.peer}</div>
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
        <div className="flex aspect-square max-h-28 w-1/3 max-w-28 items-center justify-center rounded-full bg-zinc-500 text-3xl uppercase text-white">
          {peer.peer?.[0]}
        </div>
      )}
    </div>
  )
}
