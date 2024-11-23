import { RemoteTrack, useConsumer } from '@atm0s-media-sdk/react-hooks'
import { useEffect, useRef } from 'react'

type Props = {
  track: RemoteTrack
}

export const AudioRemote: React.FC<Props> = ({ track }) => {
  const consumer = useConsumer(track)
  const audioRef = useRef<HTMLAudioElement>(null)
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
    if (audioRef.current) {
      audioRef.current.srcObject = consumer.stream
    }
  }, [consumer])

  return <audio autoPlay ref={audioRef} />
}
