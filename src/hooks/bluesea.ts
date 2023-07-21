import { StreamRemote, StreamRemoteEvent, usePeerRemoteStream } from 'bluesea-media-react-sdk'
import { useEffect, useState } from 'react'

export const usePeerRemoteStreamActive = (peer_id: string, name: string): StreamRemote | undefined => {
  const stream = usePeerRemoteStream(peer_id, name)
  const [activeStream, setActiveStream] = useState<StreamRemote | undefined>(() => {
    if (stream && stream.state.active) {
      return stream
    } else {
      return undefined
    }
  })

  useEffect(() => {
    if (stream) {
      const handler = () => {
        if (stream.state.active) {
          setActiveStream(stream)
        } else {
          setActiveStream(undefined)
        }
      }
      handler()
      stream.on(StreamRemoteEvent.STATE, handler)
      return () => {
        stream.off(StreamRemoteEvent.STATE, handler)
      }
    } else {
      setActiveStream(undefined)
    }
  }, [stream])
  return activeStream
}
