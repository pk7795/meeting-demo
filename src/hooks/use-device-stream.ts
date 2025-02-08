'use client'

import { ContextEvent, MediaContext } from '@/contexts'
import { useContext, useEffect, useState } from 'react'

export const useDeviceStream = (sourceName: string): MediaStream | undefined => {
  const ctx = useContext(MediaContext)
  const [stream, setStream] = useState(() => ctx.streams.get(sourceName))
  useEffect(() => {
    const handler = (stream: MediaStream | undefined) => {
      setStream(stream)
    }
    if (ctx.streams.get(sourceName) != stream) {
      setStream(ctx.streams.get(sourceName))
    }
    ctx.on(ContextEvent.DeviceChanged + sourceName, handler)
    return () => {
      ctx.off(ContextEvent.DeviceChanged + sourceName, handler)
    }
  }, [ctx, sourceName, stream])
  return stream
}
