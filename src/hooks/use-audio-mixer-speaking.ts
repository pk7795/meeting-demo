'use client'

import { useMixerPeerVoiceActivity } from '@atm0s-media-sdk/react-hooks'
import { useEffect, useState } from 'react'

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
