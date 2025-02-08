import { RemoteTrack, useConsumer } from '@atm0s-media-sdk/react-hooks'
import { useEffect, useRef } from 'react'

type Props = {
  track: RemoteTrack
  mirror?: boolean
}

export const VideoRemote: React.FC<Props> = ({ track, mirror = true }) => {
  const consumer = useConsumer(track)
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    consumer.attach({
      priority: 10,
      maxSpatial: 2,
      maxTemporal: 2,
    })
    return () => {
      consumer.detach()
    }
  }, [consumer])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = consumer.stream
    }
  }, [consumer])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video
        muted
        autoPlay
        playsInline
        controls={false}
        className="absolute inset-0 h-full w-full object-contain"
        ref={videoRef}
        style={{
          transform: mirror ? 'rotateY(180deg)' : 'none',
        }}
      />
    </div>
  )
}
