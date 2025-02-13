'use client'



import { useState } from 'react'
import { RoomParticipant } from '@prisma/client'
import { PeerSession } from '@/lib/ermis'
import { RoomAccessStatus } from '@/lib/constants'
import { RoomParticipantWithUser, RoomPopulated } from '@/types/types'
import { ChatContextProvider } from '@/contexts/chat'

import { Atm0sMediaProvider, AudioMixerMode } from '@atm0s-media-sdk/react-hooks'
import { SidebarProvider } from '@/components/ui/sidebar'
import { MainSection, SettingMedia } from '../sections'
import { MediaDeviceProvider, MeetingProvider } from '../contexts'

type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
  pendingParticipants: RoomParticipantWithUser[]
}

export const Meeting: React.FC<Props> = ({ room, myParticipant, access, pendingParticipants }) => {
  const [peerSession, setPeerSession] = useState<PeerSession>()
  const [joined, setJoined] = useState(false)
  const [roomParticipant, setRoomParticipant] = useState<RoomParticipant | null>(myParticipant)
  console.log('RERENDER HERE')

  return (
    <MediaDeviceProvider>
      <ChatContextProvider room={room} roomParticipant={roomParticipant}>
        {peerSession && roomParticipant && joined ? (
          <Atm0sMediaProvider
            gateway={peerSession.gateway}
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
              <SidebarProvider defaultOpen={false}>
                <MainSection room={room} myParticipant={roomParticipant} />
              </SidebarProvider>
            </MeetingProvider>
          </Atm0sMediaProvider>
        ) : (
          <SettingMedia
            onConnected={() => setJoined(true)}
            myParticipant={roomParticipant}
            room={room}
            setRoomParticipant={setRoomParticipant}
            setPeerSession={setPeerSession}
            roomAccess={access}
          />
        )}
      </ChatContextProvider>
    </MediaDeviceProvider>
  )
}
