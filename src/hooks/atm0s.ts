import { MapContainer } from './common'
import { StreamRemote, usePeerRemoteStream, useSession } from '@8xff/atm0s-media-react'
import { AudioMixSlotInfo } from '@8xff/atm0s-media-react/types/hooks/audio_level'
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
      stream.on('state', handler)
      return () => {
        stream.off('state', handler)
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
    const mixMinus = session?.getMixMinusAudio()
    if (mixMinus) {
      const handler = (index: number, info: any | null) => {
        if (info) {
          const sourceId = info[0].split(':')
          if (minAudioLevel !== undefined && info[1] >= minAudioLevel) {
            slots.set(index, {
              peerId: sourceId[0],
              streamName: sourceId[1],
              audioLevel: info[1],
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
  }, [maxSlots, session?.getMixMinusAudio()])
  return slots
}

export const useAudioSlotsQueueContainer = (maxSlots: number, minAudioLevel?: number) => {
  const slots = useAudioSlotsContainer(maxSlots, minAudioLevel)
  const talkingPeerIds = new MapContainer<string, { peerId: string; ts: number; audioLevel: number }>()

  slots.onListChanged((list) => {
    const unixTimestamp = Math.floor(Date.now() / 1000)

    const peers = list.filter((x) => x !== undefined)

    // Delete every key that is not in slots
    const inActiveIds = Array.from(talkingPeerIds.map.keys()).filter((x: string) => !peers.find((p) => x === p?.peerId))
    const newPeers = peers.filter((x) => !talkingPeerIds.has(x?.peerId as string))
    if (inActiveIds.length > 0) {
      talkingPeerIds.delBatch(inActiveIds)
    }
    // Add every key that is not in current map
    if (newPeers.length > 0) {
      const newMap = new Map<string, { peerId: string; ts: number; audioLevel: number }>()
      for (const p of newPeers) {
        newMap.set(p!.peerId, {
          peerId: p!.peerId,
          ts: unixTimestamp,
          audioLevel: p!.audioLevel!,
        })
      }
      talkingPeerIds.setBatch(newMap)
    }

    // Update audio level for every key
    for (const p of peers) {
      talkingPeerIds.set(p!.peerId!, {
        ...talkingPeerIds.get(p!.peerId)!,
        audioLevel: p!.audioLevel!,
      })
    }
  })

  return talkingPeerIds
}
