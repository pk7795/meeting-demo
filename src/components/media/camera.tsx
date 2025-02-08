import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { MediaContext } from '@/contexts'
import { useDeviceStream } from '@/hooks'
import { BitrateControlMode, Kind } from '@atm0s-media-sdk/core'
import { usePublisher } from '@atm0s-media-sdk/react-hooks'
import { DropdownMenu, DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { filter, map } from 'lodash'
import { ChevronDown, ChevronUp, VideoIcon, VideoOffIcon } from 'lucide-react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type CameraPreviewProps = {
  sourceName: string
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ sourceName }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stream = useDeviceStream(sourceName)
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      return () => {
        if (videoRef.current?.srcObject) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          videoRef.current!.srcObject = null
        }
      }
    }
  }, [stream])

  return (
    <>
      {stream ? (
        <video
          className="rounded-lg h-[250px]"
          ref={videoRef}
          autoPlay
          muted
          style={{
            transform: 'rotateY(180deg)',
          }}
        />
      ) : (
        <div className="h-[250px] w-full rounded-lg bg-black" />
      )}
    </>
  )
}

type CameraSelectionProps = {
  sourceName: string
  isFirstPage?: boolean
}

const PUBLISHER_CONFIG = {
  simulcast: true,
  priority: 1,
  bitrate: BitrateControlMode.DYNAMIC_CONSUMERS,
}

export const CameraSelection: React.FC<CameraSelectionProps> = ({ sourceName }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const ctx = useContext(MediaContext)

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
  }, [ctx, sourceName, setDevices])

  const onChange = useCallback(
    (value: string) => {
      ctx
        .requestDevice(sourceName, 'video', value)
        .then(() => {
          setSelectedDevice(value)
        })
        .catch(console.error)
    },
    [ctx, sourceName]
  )

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

export const CameraToggle: React.FC<CameraSelectionProps> = ({ sourceName, isFirstPage }) => {
  const ctx = useContext(MediaContext)
  // const publisher = usePublisher(sourceName, Kind.VIDEO, PUBLISHER_CONFIG)
  const stream = useDeviceStream(sourceName)

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'video')
      }
    }

    init()
  }, [ctx, sourceName, isFirstPage])

  // useEffect(() => {
  //   const track = stream?.getVideoTracks()[0]
  //   if (track && !publisher.attached) {
  //     publisher.attach(track)
  //   } else if (!track && publisher.attached) {
  //     publisher.detach()
  //   }
  // }, [publisher, stream])

  const onToggle = useCallback(() => {
    if (stream) {
      ctx.turnOffDevice(sourceName)
    } else {
      ctx.requestDevice(sourceName, 'video').then(console.log).catch(console.error)
    }
  }, [ctx, sourceName, stream])

  return (
    <Button variant={stream ? 'secondary' : 'destructive'} size="icon" onClick={onToggle}>
      {stream ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
    </Button>
  )
}

export const CameraToggleV2: React.FC<CameraSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.VIDEO, PUBLISHER_CONFIG)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream(sourceName)
  const [isOpenSetting, setIsOpenSetting] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'video')
      }
    }

    init()
  }, [ctx, sourceName, isFirstPage])

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
      ctx.requestDevice(sourceName, 'video').then(console.log).catch(console.error)
    }
  }, [ctx, sourceName, stream])
  return (
    <Button
      variant={'secondary'}
      size="full"
      className={'gap-0 bg-secondary/90 p-0'}
      onClick={() => setIsOpenSetting((prev) => !prev)}
    >
      <DropdownMenu open={isOpenSetting} onOpenChange={(v) => setIsOpenSetting(v)}>
        <DropdownMenuTrigger className={'aspect-square h-full'}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={'flex aspect-square h-full items-center justify-center'}>
                {!isOpenSetting ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Camera setting</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={'w-80 border-none'}>
          <DropdownMenuLabel>Settings camera</DropdownMenuLabel>
          <DropdownMenuItem>
            <CameraSelection sourceName="video_main" />
          </DropdownMenuItem>
          <DropdownMenuArrow className="fill-white" />
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        variant={stream ? 'secondary' : 'destructive'}
        size="full"
        className={'aspect-square h-full [&_svg]:!size-full'}
      >
        {stream ? <VideoIcon size={16} /> : <VideoOffIcon size={16} />}
      </Button>
    </Button>
  )
}
