'use client'

import { Atm0sSenders } from '../constants'
import { MediaDeviceProvider, MeetingProvider } from '../contexts'
import { PrepareSection } from '../sections'
import { MainSection } from '../sections/MainSection'
import { MixMinusMode, SessionProvider, useSharedDisplayMedia, useSharedUserMedia } from '@8xff/atm0s-media-react'
import { useEffect, useMemo, useState } from 'react'
import { RoomParticipant } from '@prisma/client'
import { Atm0sSession } from '@/lib/atm0s'
import { RoomAccessStatus } from '@/lib/constants'
import { RoomParticipantWithUser, RoomPopulated } from '@/types/types'
type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
  pendingParticipants: RoomParticipantWithUser[]
}

export const Meeting: React.FC<Props> = ({ room, myParticipant, access, pendingParticipants }) => {
  const [atm0sConfig, setAtm0sConfig] = useState<Atm0sSession>()
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

  // useSharedUserMedia('mic_device')
  // useSharedUserMedia('camera_device')
  // useSharedDisplayMedia('screen_device')

  return (
    <MediaDeviceProvider>
      {atm0sConfig && roomParticipant && joined ? (
        <SessionProvider
          logLevel={atm0sConfig.log_level}
          gateways={atm0sConfig.gateway}
          room={atm0sConfig.room}
          peer={atm0sConfig.peer}
          token={atm0sConfig.token}
          autoConnect={false}
          onConnectError={console.error}
          mixMinusAudio={{
            mode: MixMinusMode.AllAudioStreams,
            elements: createAudio,
          }}
          senders={senders}
          receivers={{ audio: 0, video: 5 }}
        >
          <MeetingProvider room={room} roomParticipant={roomParticipant} pendingParticipantsList={pendingParticipants}>
            <MainSection room={room} myParticipant={roomParticipant} />
          </MeetingProvider>
        </SessionProvider>
      ) : (
        <PrepareSection
          room={room}
          onJoinMeeting={() => {
            setJoined(true)
          }}
          setRoomParticipant={setRoomParticipant}
          setAtm0sConfig={setAtm0sConfig}
          myParticipant={roomParticipant}
          roomAccess={access}
        />
      )}
    </MediaDeviceProvider>
  )
}
