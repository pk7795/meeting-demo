import { useDeviceStream } from '../../hooks'
import { Atm0sMediaUIContext } from '../../provider'
import { useContext, useEffect, useRef } from 'react'
import { getCookie } from '@atm0s-media-sdk/ui/lib/cookies'

type Props = {
  source_name: string
  stream_video_screen?: MediaStream
}

export const PeerLocal: React.FC<Props> = ({ source_name, stream_video_screen }) => {
  const username = getCookie('username')
  const stream = useDeviceStream(source_name)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ctx = useContext(Atm0sMediaUIContext)

  useEffect(() => {
    if (videoRef.current) {
      if (stream_video_screen) {
        videoRef.current.srcObject = stream_video_screen
      } else {
        videoRef.current.srcObject = stream || null
      }
      return () => {
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }
  }, [stream, stream_video_screen, videoRef.current])

  return (
    <div className="w-full h-full max-h-[calc(100vh-65px)] flex items-center justify-center bg-zinc-800 rounded-2xl overflow-hidden relative">
      <div className="absolute left-2 bottom-3 flex items-center gap-1">
        <div className="bg-slate-950 bg-opacity-30 px-2 py-0.5 rounded-full text-white text-sm">
          {username} {stream_video_screen && `(You, presenting)`}
        </div>
      </div>
      {stream_video_screen && (
        <div
          onClick={() => ctx.turnOffDevice('video_screen')}
          className="bg-blue-500 px-3 py-1.5 rounded-full text-white text-sm cursor-pointer absolute right-2 bottom-3 z-50"
        >
          Stop presenting
        </div>
      )}
      {stream ? (
        <video
          muted
          autoPlay
          playsInline
          controls={false}
          className="h-full aspect-video"
          ref={videoRef}
          style={{
            transform: !stream_video_screen ? 'rotateY(180deg)' : 'none',
          }}
        />
      ) : (
        <div className="bg-zinc-500 flex items-center justify-center w-28 h-28 rounded-full text-6xl text-white uppercase">
          {username?.[0]}
        </div>
      )}
    </div>
  )
}
