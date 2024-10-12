import { useAudioMixerSpeaking } from '../../hooks'
import { VideoRemote } from './video_remote'
import { find, isEmpty } from 'lodash'
import { RemotePeer, RemoteTrack, useRemoteVideoTracks } from '@atm0s-media-sdk/react-hooks'
import { cn } from '@atm0s-media-sdk/ui/lib/utils'
import { useEffect } from 'react'

type Props = {
  peer: RemotePeer
  setVideoScreen?: (v: any) => void
}

export const PeerRemoteMixerAudio: React.FC<Props> = ({ peer ,setVideoScreen}) => {
  const remote_videos = useRemoteVideoTracks(peer.peer)
  const { speaking } = useAudioMixerSpeaking(peer.peer)
  const video_main = find(remote_videos, (t) => t.track === 'video_main')
  const video_screen = find(remote_videos, (t) => t.track === 'video_screen')

  useEffect(() => {
    setVideoScreen?.(video_screen)
  }, [video_screen])

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center bg-zinc-800 rounded-2xl overflow-hidden relative',
        {
          'ring-4 ring-green-500 ring-opacity-70': speaking,
        }
      )}
    >
      <div className="absolute left-2 bottom-3 flex items-center gap-1">
        <div className="bg-slate-950 bg-opacity-30 px-2 py-0.5 rounded-full text-white text-sm">{peer.peer}</div>
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
        <div className="bg-zinc-500 flex items-center justify-center max-w-28 max-h-28 w-1/3 aspect-square rounded-full text-3xl text-white uppercase">
          {peer.peer?.[0]}
        </div>
      )}
    </div>
  )
}
