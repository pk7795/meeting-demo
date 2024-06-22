import { useDeviceStream } from '../../hooks'
import { Atm0sMediaUIContext } from '../../provider'
import { filter, map } from 'lodash'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BitrateControlMode, Kind } from '@atm0s-media-sdk/core/lib'
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
import { VideoIcon, VideoOffIcon } from '@atm0s-media-sdk/ui/icons/index'

type CameraPreviewProps = {
  source_name: string
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ source_name }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stream = useDeviceStream(source_name)
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      return () => {
        if (videoRef.current?.srcObject) {
          videoRef.current!.srcObject = null
        }
      }
    }
  }, [stream, videoRef.current])

  return (
    <>
      {stream ? (
        <video
          className="rounded-lg"
          ref={videoRef}
          autoPlay
          muted
          style={{
            transform: 'rotateY(180deg)',
          }}
        />
      ) : (
        <div className="w-full h-[250px] bg-black rounded-lg" />
      )}
    </>
  )
}

type CameraSelectionProps = {
  source_name: string
  first_page?: boolean
}

const PUBLISHER_CONFIG = {
  simulcast: true,
  priority: 1,
  bitrate: BitrateControlMode.DYNAMIC_CONSUMERS,
}

export const CameraSelection: React.FC<CameraSelectionProps> = ({ source_name }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const ctx = useContext(Atm0sMediaUIContext)

  useEffect(() => {
    const init = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const devices = map(
        filter(allDevices, (d) => d.kind == 'videoinput'),
        (d) => {
          return { id: d.deviceId, label: d.label }
        }
      )
      setDevices(devices)
      setSelectedDevice(devices?.[0]?.id)
    }

    init()
  }, [ctx, source_name, setDevices])

  const onChange = useCallback((value: string) => {
    ctx
      .requestDevice(source_name, 'video', value)
      .then(() => {
        setSelectedDevice(value)
      })
      .catch(console.error)
  }, [])

  return (
    <Select value={selectedDevice} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select camera" />
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

export const CameraToggle: React.FC<CameraSelectionProps> = ({ source_name, first_page }) => {
  const publisher = usePublisher(source_name, Kind.VIDEO, PUBLISHER_CONFIG)
  const ctx = useContext(Atm0sMediaUIContext)
  const stream = useDeviceStream(source_name)

  useEffect(() => {
    const init = async () => {
      if (first_page) {
        await ctx.requestDevice(source_name, 'video')
      }
    }

    init()
  }, [ctx, source_name, first_page])

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
      ctx.requestDevice(source_name, 'video').then(console.log).catch(console.error)
    }
  }, [ctx, stream])

  return (
    <Button variant={stream ? 'secondary' : 'destructive'} size="icon" onClick={onToggle}>
      {stream ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
    </Button>
  )
}
