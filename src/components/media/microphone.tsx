import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { MediaContext } from '@/context'
import { Kind } from '@atm0s-media-sdk/core'
import { usePublisher } from '@atm0s-media-sdk/react-hooks'
import { DropdownMenu, DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { filter, map } from 'lodash'
import { ChevronDown, ChevronUp, MicIcon, MicOffIcon } from 'lucide-react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useDeviceStream } from '../../hooks'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type MicrophonePreviewProps = {
  sourceName: string
}

export const MicrophonePreview: React.FC<MicrophonePreviewProps> = ({ sourceName }) => {
  const audioRef = useRef<HTMLVideoElement>(null)
  const stream = useDeviceStream(sourceName)
  useEffect(() => {
    if (stream && audioRef.current) {
      audioRef.current.srcObject = stream
      return () => {
        if (audioRef.current?.srcObject) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          audioRef.current!.srcObject = null
        }
      }
    }
  }, [stream])

  return <audio ref={audioRef} controls autoPlay muted />
}

type MicrophoneSelectionProps = {
  sourceName: string
  isFirstPage?: boolean
}

export const MicrophoneSelection: React.FC<MicrophoneSelectionProps> = ({ sourceName, isFirstPage }) => {
  const [devices, setDevices] = useState<{ id: string; label: string }[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const ctx = useContext(MediaContext)

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
  }, [ctx, sourceName, setDevices, isFirstPage])

  const onChange = useCallback(
    (value: string) => {
      ctx
        .requestDevice(sourceName, 'audio', value)
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

export const MicrophoneToggle: React.FC<MicrophoneSelectionProps> = ({ sourceName, isFirstPage }) => {
  // const publisher = usePublisher(sourceName, Kind.AUDIO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream(sourceName)

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'audio')
      }
    }

    init()
  }, [ctx, sourceName, isFirstPage])

  // useEffect(() => {
  //   const track = stream?.getAudioTracks()[0]
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
      ctx.requestDevice(sourceName, 'audio').then(console.log).catch(console.error)
    }
  }, [ctx, sourceName, stream])

  return (
    <Button variant={stream ? 'secondary' : 'destructive'} size="icon" onClick={onToggle}>
      {stream ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
    </Button>
  )
}

export const MicrophoneToggleV2: React.FC<MicrophoneSelectionProps> = ({ sourceName, isFirstPage }) => {
  const publisher = usePublisher(sourceName, Kind.AUDIO)
  const ctx = useContext(MediaContext)
  const stream = useDeviceStream(sourceName)

  const [isOpenSetting, setIsOpenSetting] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (isFirstPage) {
        await ctx.requestDevice(sourceName, 'audio')
      }
    }

    init()
  }, [ctx, sourceName, isFirstPage])

  useEffect(() => {
    const track = stream?.getAudioTracks()[0]
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
      ctx.requestDevice(sourceName, 'audio').then(console.log).catch(console.error)
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
              <p>Audio setting</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={'w-80 border-none'}>
          <DropdownMenuLabel>Settings audio input</DropdownMenuLabel>
          <DropdownMenuItem>
            <MicrophoneSelection sourceName="audio_main" />
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
        {stream ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
      </Button>
    </Button>
  )
}
