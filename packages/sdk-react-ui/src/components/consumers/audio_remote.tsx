import { useEffect, useRef } from 'react'
import { RemoteTrack, useConsumer, useConsumerVoiceActivity } from '@atm0s-media-sdk/react-hooks'

type Props = {
  track: RemoteTrack
}

export const AudioRemote: React.FC<Props> = ({ track }) => {
  const consumer = useConsumer(track)
  const _audioActivity = useConsumerVoiceActivity(consumer)
  //TODO show audio activity here
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
  }, [consumer, audioRef.current])

  return <audio autoPlay ref={audioRef} />
}
