'use client'

import { Meeting, SettingsMedia } from './containers'
import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AudioMixerMode, SessionConfig } from '@atm0s-media-sdk/core/lib'
import { Atm0sMediaProvider } from '@atm0s-media-sdk/react-hooks/lib'
import { Atm0sMediaUIProvider } from '@atm0s-media-sdk/react-ui/lib'
import { env } from '@/config/env'

export default function RoomScreen() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gatewayIndex = parseInt(searchParams!.get('gateway') || '0')
  const token = searchParams!.get('token')
  const room = params?.room
  const peer = searchParams!.get('peer')

  console.log('--------------------------------------------------------')
  console.log('gatewayIndex', env.GATEWAYS[gatewayIndex])
  console.log('token', token)
  console.log('room', room)
  console.log('peer', peer)
  console.log('--------------------------------------------------------')

  const cfg = {
    token,
    join: {
      room,
      peer,
      publish: { peer: true, tracks: true },
      subscribe: { peers: true, tracks: true },
      features: {
        mixer: {
          mode: AudioMixerMode.AUTO,
          outputs: 3,
        },
      },
    },
  } as SessionConfig

  const [inRoom, setInRoom] = useState(false)

  return (
    <Atm0sMediaProvider gateway={env.GATEWAYS[gatewayIndex]!} cfg={cfg} prepareAudioReceivers={3} prepareVideoReceivers={3}>
      <Atm0sMediaUIProvider>
        {!inRoom && <SettingsMedia onConnected={() => setInRoom(true)} />}
        {inRoom && <Meeting />}
      </Atm0sMediaUIProvider>
    </Atm0sMediaProvider>
  )
}
