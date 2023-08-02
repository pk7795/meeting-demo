import { MapContainer, useReactionList } from './common'
import { StreamRemote, StreamRemoteEvent, usePeerRemoteStream, useSession } from 'bluesea-media-react-sdk'
import { AudioMixSlotInfo } from 'bluesea-media-react-sdk/dist/cjs/core/hooks/audio_level'
import { range } from 'lodash'
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

export const useAudioSlotsContainer = (maxSlots: number, minAudioLevel?: number) => {
  const slots = new MapContainer<number, AudioMixSlotInfo | undefined>()

  const session = useSession()
  useEffect(() => {
    const mixMinus = session.getMixMinusAudio()
    if (mixMinus) {
      const handler = (index: number, info: any | null) => {
        if (info) {
          const sourceId = info[0].split(':')
          if (minAudioLevel !== undefined && info[1] >= minAudioLevel) {
            slots.set(index, {
              peer_id: sourceId[0],
              stream_name: sourceId[1],
              audio_level: info[1],
            })
          }
        } else {
          slots.set(index, undefined)
        }
      }
      range(maxSlots).forEach((slotIndex) => {
        mixMinus.on(`slot_${slotIndex}`, (_info: any | null) => handler(slotIndex, _info))
      })

      return () => {
        range(maxSlots).forEach((slotIndex) => {
          mixMinus.off(`slot_${slotIndex}`, (_info: any | null) => handler(slotIndex, _info))
        })
      }
    }
  }, [maxSlots, session.getMixMinusAudio()])
  return slots
}

export const useAudioSlotsQueueContainer = (maxSlots: number, minAudioLevel?: number) => {
  const slots = useAudioSlotsContainer(maxSlots, minAudioLevel)
  const talkingPeerIds = new MapContainer<string, { peerId: string; ts: number }>()

  slots.onListChanged((list) => {
    const unixTimestamp = Math.floor(Date.now() / 1000)

    const peerIds = list.map((x) => x?.peer_id).filter((x) => x !== undefined) as string[]

    // Delete every key that is not in slots
    const inActiveIds = Array.from(talkingPeerIds.map.keys()).filter((x) => !peerIds.includes(x))
    const newIds = peerIds.filter((x) => !talkingPeerIds.has(x))
    if (inActiveIds.length > 0) {
      talkingPeerIds.delBatch(inActiveIds)
    }
    // Add every key that is not in current map
    if (newIds.length > 0) {
      const newMap = new Map<string, { peerId: string; ts: number }>()
      for (const id of newIds) {
        newMap.set(id, { peerId: id, ts: unixTimestamp })
      }
      talkingPeerIds.setBatch(newMap)
    }
  })

  return talkingPeerIds
}
