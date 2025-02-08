import { MediaContext } from '@/contexts'
import { useDeviceStream } from '@/hooks'
import { Kind } from '@atm0s-media-sdk/core'
import { usePublisher } from '@atm0s-media-sdk/react-hooks'
import { ScreenShareIcon, ScreenShareOffIcon } from 'lucide-react'
import { useCallback, useContext, useEffect } from 'react'
import { Button } from '../ui/button'

type MicrophoneSelectionProps = {
  sourceName: string
}

export const ScreenToggle: React.FC<MicrophoneSelectionProps> = ({ sourceName }) => {
  const publisher = usePublisher(sourceName, Kind.VIDEO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream(sourceName)

  useEffect(() => {
    const track = stream?.getVideoTracks()[0]
    if (track && !publisher.attached) {
      publisher.attach(track)
    } else if (!track && publisher.attached) {
      publisher.detach()
    }
  }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(sourceName)
    } else {
      ctx.requestDevice(sourceName, 'screen').then(console.log).catch(console.error)
    }
  }, [ctx, sourceName, stream])

  return (
    <Button variant={stream ? 'default' : 'secondary'} size="icon" onClick={onToggle}>
      {!stream ? <ScreenShareIcon size={16} /> : <ScreenShareOffIcon size={16} />}
    </Button>
  )
}

export const ScreenToggleV2: React.FC<MicrophoneSelectionProps> = ({ }) => {
  const publisher = usePublisher('video_screen', Kind.VIDEO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream('video_screen')

  useEffect(() => {
    stream?.getVideoTracks()[0].addEventListener('ended', () => {
      ctx.turnOffDevice('video_screen')
    })
  }, [ctx, stream])

  useEffect(() => {
    const track = stream?.getVideoTracks()?.[0]
    if (track && !publisher.attached) {
      publisher.attach(track)
    } else if (!track && publisher.attached) {
      publisher.detach()
    }
  }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice('video_screen')
    } else {
      ctx.requestDevice('video_screen', 'screen').then(console.log).catch(console.error)
    }
  }, [ctx, stream])

  return (
    <Button variant={stream ? 'blue' : 'secondary'} size={'full'} onClick={onToggle} className={'[&_svg]:!size-full'}>
      {!stream ? <ScreenShareIcon size={16} /> : <ScreenShareOffIcon size={16} />}
    </Button>
  )
}
