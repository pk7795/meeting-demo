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
    <video
      muted
      autoPlay
      playsInline
      controls={false}
      className="aspect-video h-full"
      ref={videoRef}
      style={{
        transform: mirror ? 'rotateY(180deg)' : 'none',
      }}
    />
  )
}
