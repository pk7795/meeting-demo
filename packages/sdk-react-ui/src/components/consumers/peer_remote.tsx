import { AudioRemote } from './audio_remote'
import { VideoRemote } from './video_remote'
import { isEmpty, map } from 'lodash'
import { RemotePeer, useRemoteAudioTracks, useRemoteVideoTracks } from '@atm0s-media-sdk/react-hooks/lib'

type Props = {
  peer: RemotePeer
}

export const PeerRemoteDirectAudio: React.FC<Props> = ({ peer }) => {
  const remote_audios = useRemoteAudioTracks(peer.peer)
  const remote_videos = useRemoteVideoTracks(peer.peer)

  return (
    <div className="w-full h-full max-h-[calc(100vh-65px)] flex items-center justify-center bg-zinc-800 rounded-2xl overflow-hidden relative">
      <div className="absolute left-2 bottom-3 flex items-center gap-1">
        <div className="bg-slate-950 bg-opacity-30 px-2 py-0.5 rounded-full text-white text-sm">{peer.peer}</div>
      </div>
      {!isEmpty(remote_videos) ? (
        map(remote_videos, (t) => <VideoRemote key={t.track} track={t} />)
      ) : (
        <div className="bg-zinc-500 flex items-center justify-center w-28 h-28 rounded-full text-6xl text-white uppercase">
          {peer.peer?.[0]}
        </div>
      )}
      {map(remote_audios, (t) => (
        <AudioRemote key={t.track} track={t} />
      ))}
    </div>
  )
}

export const PeerRemoteMixerAudio: React.FC<Props> = ({ peer }) => {
  const remote_videos = useRemoteVideoTracks(peer.peer)

  return (
    <div className="w-full h-full max-h-[calc(100vh-65px)] flex items-center justify-center bg-zinc-800 rounded-2xl overflow-hidden relative">
      <div className="absolute left-2 bottom-3 flex items-center gap-1">
        <div className="bg-slate-950 bg-opacity-30 px-2 py-0.5 rounded-full text-white text-sm">{peer.peer}</div>
      </div>
      {!isEmpty(remote_videos) ? (
        map(remote_videos, (t) => <VideoRemote key={t.track} track={t} />)
      ) : (
        <div className="bg-zinc-500 flex items-center justify-center w-28 h-28 rounded-full text-6xl text-white uppercase">
          {peer.peer?.[0]}
        </div>
      )}
    </div>
  )
}
