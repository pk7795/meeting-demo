import { useDeviceStream } from '../../hooks'
import { Atm0sMediaUIContext } from '../../provider'
import { filter, map } from 'lodash'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Kind } from '@atm0s-media-sdk/core/lib'
import { usePublisher } from '@atm0s-media-sdk/react-hooks/lib'
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@atm0s-media-sdk/ui/components/index'
import { MicIcon, MicOffIcon } from '@atm0s-media-sdk/ui/icons/index'

type MicrophonePreviewProps = {
  source_name: string
}

export const MicrophonePreview: React.FC<MicrophonePreviewProps> = ({ source_name }) => {
  const audioRef = useRef<HTMLVideoElement>(null)
  const stream = useDeviceStream(source_name)
  useEffect(() => {
    if (stream && audioRef.current) {
      audioRef.current.srcObject = stream
      return () => {
        if (audioRef.current?.srcObject) {
          audioRef.current!.srcObject = null
        }
      }
    }
  }, [stream, audioRef.current])

  return <audio ref={audioRef} controls autoPlay muted />
}

type MicrophoneSelectionProps = {
  source_name: string
  first_page?: boolean
}

export const MicrophoneSelection: React.FC<MicrophoneSelectionProps> = ({ source_name, first_page }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const ctx = useContext(Atm0sMediaUIContext)

  useEffect(() => {
    const init = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const devices = map(
        filter(allDevices, (d) => d.kind == 'audioinput'),
        (d) => {
          return { id: d.deviceId, label: d.label }
        }
      )
      setDevices(devices)
      setSelectedDevice(devices?.[0]?.id)
    }

    init()
  }, [ctx, source_name, setDevices, first_page])

  const onChange = useCallback((value: string) => {
    ctx.requestDevice(source_name, 'audio', value).then(console.log).catch(console.error)
  }, [])

  return (
    <Select value={selectedDevice} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select microphone" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {map(devices, (device) => (
            <SelectItem key={device.id} value={device.id}>
              {device.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const MicrophoneToggle: React.FC<MicrophoneSelectionProps> = ({ source_name, first_page }) => {
  const publisher = usePublisher(source_name, Kind.AUDIO)
  const ctx = useContext(Atm0sMediaUIContext)
  const stream = useDeviceStream(source_name)

  useEffect(() => {
    const init = async () => {
      if (first_page) {
        await ctx.requestDevice(source_name, 'audio')
      }
    }

    init()
  }, [ctx, source_name, first_page])

  useEffect(() => {
    let track = stream?.getAudioTracks()[0]
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
      ctx.requestDevice(source_name, 'audio').then(console.log).catch(console.error)
    }
  }, [ctx, stream])

  return (
    <Button variant={stream ? 'secondary' : 'destructive'} size="icon" onClick={onToggle}>
      {stream ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
    </Button>
  )
}
