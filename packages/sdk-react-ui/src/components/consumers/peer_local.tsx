import { useDeviceStream } from '../../hooks'
import { useEffect, useRef } from 'react'
import { getCookie } from '@atm0s-media-sdk/ui/lib/cookies'

type Props = {
  source_name: string
}

export const PeerLocal: React.FC<Props> = ({ source_name }) => {
  const username = getCookie('username')
  const stream = useDeviceStream(source_name)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null
      return () => {
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }
  }, [stream, videoRef.current])

  return (
    <div className="w-full h-full max-h-[calc(100vh-65px)] flex items-center justify-center bg-zinc-800 rounded-2xl overflow-hidden relative">
      <div className="absolute left-2 bottom-3 flex items-center gap-1">
        <div className="bg-slate-950 bg-opacity-30 px-2 py-0.5 rounded-full text-white text-sm">{username}</div>
      </div>
      {stream ? (
        <video muted autoPlay className="h-full aspect-video" ref={videoRef} />
      ) : (
        <div className="bg-zinc-500 flex items-center justify-center w-28 h-28 rounded-full text-6xl text-white uppercase">
          {username?.[0]}
        </div>
      )}
    </div>
  )
}
