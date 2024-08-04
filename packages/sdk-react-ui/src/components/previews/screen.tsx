import { useDeviceStream } from '../../hooks'
import { Atm0sMediaUIContext } from '../../provider'
import { useCallback, useContext, useEffect } from 'react'
import { Kind } from '@atm0s-media-sdk/core'
import { usePublisher } from '@atm0s-media-sdk/react-hooks'
import { Button } from '@atm0s-media-sdk/ui/components/index'
import { ScreenShareIcon, ScreenShareOffIcon } from '@atm0s-media-sdk/ui/icons/index'

type MicrophoneSelectionProps = {
  source_name: string
  first_page?: boolean
}

export const ScreenToggle: React.FC<MicrophoneSelectionProps> = ({ source_name }) => {
  const publisher = usePublisher(source_name, Kind.VIDEO)
  const ctx = useContext(Atm0sMediaUIContext)
  const stream = useDeviceStream(source_name)

  useEffect(() => {
    let track = stream?.getVideoTracks()[0]
    if (track && !publisher.attached) {
      publisher.attach(track)
    } else if (!track && publisher.attached) {
      publisher.detach()
    }
  }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(source_name)
    } else {
      ctx.requestDevice(source_name, 'screen').then(console.log).catch(console.error)
    }
  }, [ctx, stream])

  return (
    <Button variant={stream ? 'default' : 'secondary'} size="icon" onClick={onToggle}>
      {!stream ? <ScreenShareIcon size={16} /> : <ScreenShareOffIcon size={16} />}
    </Button>
  )
}
