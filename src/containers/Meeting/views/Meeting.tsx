'use client'

import { Atm0sSenders } from '../constants'
import { MediaDeviceProvider, MeetingProvider } from '../contexts'
import { MainSection } from '../sections/MainSection'
import { useEffect, useMemo, useState } from 'react'
import { RoomParticipant } from '@prisma/client'
import { peerSession } from '@/lib/atm0s'
import { RoomAccessStatus } from '@/lib/constants'
import { RoomParticipantWithUser, RoomPopulated } from '@/types/types'
import { ChatContextProvider } from '@/contexts/chat'
import { SettingSection } from '../sections/SettingSection'
import { Atm0sMediaProvider, AudioMixerMode } from '@atm0s-media-sdk/react-hooks'
type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
  pendingParticipants: RoomParticipantWithUser[]
}

export const Meeting: React.FC<Props> = ({ room, myParticipant, access, pendingParticipants }) => {
  const [peerSession, setPeerSession] = useState<peerSession>()
  const [joined, setJoined] = useState(false)
  const [roomParticipant, setRoomParticipant] = useState<RoomParticipant | null>(myParticipant)
  console.log('RERENDER HERE')
  const senders = useMemo(() => {
    return [Atm0sSenders.audio, Atm0sSenders.video, Atm0sSenders.screen_audio, Atm0sSenders.screen_video]
  }, [])

  const createAudio: [HTMLAudioElement, HTMLAudioElement, HTMLAudioElement] = useMemo(() => {
    const audio1 = document.createElement('audio')
    audio1.id = 'id-audio-1'
    audio1.autoplay = true
    audio1.hidden = false
    const audio2 = document.createElement('audio')
    audio2.id = 'id-audio-2'
    audio2.autoplay = true
    audio2.hidden = false
    const audio3 = document.createElement('audio')
    audio3.id = 'id-audio-3'
    audio3.autoplay = true
    audio3.hidden = false

    return [audio1, audio2, audio3]
  }, [])

  useEffect(() => {
    document.body.appendChild(createAudio[0])
    document.body.appendChild(createAudio[1])
    document.body.appendChild(createAudio[2])
    return () => {
      document.getElementById('id-audio-1')?.remove()
      document.getElementById('id-audio-2')?.remove()
      document.getElementById('id-audio-3')?.remove()
    }
  }, [createAudio])

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
              <MainSection room={room} myParticipant={roomParticipant} />
            </MeetingProvider>
          </Atm0sMediaProvider>
        ) : (
          <SettingSection
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
