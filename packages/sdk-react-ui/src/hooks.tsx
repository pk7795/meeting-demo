import { ContextEvent } from './context'
import { Atm0sMediaUIContext } from './provider'
import { useContext, useEffect, useState } from 'react'
import { useMixerPeerVoiceActivity } from '@atm0s-media-sdk/react-hooks'

export const useDeviceStream = (source_name: string): MediaStream | undefined => {
  const ctx = useContext(Atm0sMediaUIContext)
  const [stream, setStream] = useState(() => ctx.streams.get(source_name))
  useEffect(() => {
    const handler = (stream: MediaStream | undefined) => {
      setStream(stream)
    }
    if (ctx.streams.get(source_name) != stream) {
      setStream(ctx.streams.get(source_name))
    }
    ctx.on(ContextEvent.DeviceChanged + source_name, handler)
    return () => {
      ctx.off(ContextEvent.DeviceChanged + source_name, handler)
    }
  }, [source_name])
  return stream
}

export const useAudioMixerSpeaking = (peer: string) => {
  const [speaking, setSpeaking] = useState(false)
  const voiceActivity = useMixerPeerVoiceActivity(peer)
  useEffect(() => {
    if (voiceActivity?.active) {
      setSpeaking(true)
      const timeout = setTimeout(() => {
        setSpeaking(false)
      }, 1000)
      return () => {
        clearTimeout(timeout)
      }
    } else {
      setSpeaking(false)
    }
  }, [setSpeaking, voiceActivity])

  return {
    speaking,
  }
}
