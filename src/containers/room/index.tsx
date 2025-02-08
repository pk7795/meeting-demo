'use client'

import { env } from '@/config'
import { Layout } from '@/layouts'
import { RoomAccessStatus } from '@/lib/constants'
import { MediaProvider } from '@/providers'
import { MeetingProvider } from '@/providers/meeting-provider'
import { RoomParticipantWithUser, RoomPopulated } from '@/types/types'
import { AudioMixerMode } from '@atm0s-media-sdk/core'
import { Atm0sMediaProvider } from '@atm0s-media-sdk/react-hooks'
import { RoomParticipant } from '@prisma/client'
import { useState } from 'react'
import { Meeting } from './meeting'
import { SettingsMedia } from './settings-media'

type Props = {
  host: string | null
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
  pendingParticipants: RoomParticipantWithUser[]
}
export interface PeerSession {
  room: string
  peer: string
  token: string
}
export const Room: React.FC<Props> = ({ host, room, myParticipant, access, pendingParticipants }) => {
  const [peerSession, setPeerSession] = useState<PeerSession>()
  console.log('RERENDER HERE')
  const [roomParticipant, setRoomParticipant] = useState<RoomParticipant | null>(myParticipant)
  const [inRoom, setInRoom] = useState(false)

  return (
    <Layout>
      <MediaProvider>
        {inRoom && peerSession && roomParticipant && (
          <Atm0sMediaProvider
            gateway={env.GATEWAYS}
            cfg={{
              token: peerSession.token,
              join: {
                room: room.id,
                peer: peerSession.peer,
                publish: { peer: true, tracks: true },
                subscribe: { peers: true, tracks: true },
                features: {
                  mixer: {
                    mode: AudioMixerMode.AUTO,
                    outputs: 3,
                  },
                },
              },
            }}
            prepareAudioReceivers={3}
            prepareVideoReceivers={3}
          >
            <MeetingProvider room={room} roomParticipant={roomParticipant} pendingParticipantsList={pendingParticipants}>
              <Meeting host={host} roomParticipant={room} myParticipant={myParticipant} />
            </MeetingProvider>
          </Atm0sMediaProvider>
        )}
        {!inRoom && (
          <SettingsMedia
            onConnected={() => setInRoom(true)}
            myParticipant={roomParticipant}
            room={room}
            setRoomParticipant={setRoomParticipant}
            setPeerSession={setPeerSession}
            roomAccess={access}
          />
        )}
      </MediaProvider>
    </Layout>
  )
}
