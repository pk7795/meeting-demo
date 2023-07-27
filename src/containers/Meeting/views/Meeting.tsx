'use client'

import { BlueseaSenders } from '../constants'
import { MediaDeviceProvider, MeetingProvider } from '../contexts'
import { PrepareSection } from '../sections'
import { MainSection } from '../sections/MainSection'
import {
  BlueseaSessionProvider,
  LogLevel,
  MixMinusMode,
  useSharedDisplayMedia,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import { useEffect, useMemo, useState } from 'react'
import { RoomParticipant } from '@prisma/client'
import { BlueseaSession } from '@/lib/bluesea'
import { RoomAccessStatus } from '@/lib/constants'
import { RoomParticipantWithUser, RoomPopulated } from '@/types/types'

type Props = {
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  access: RoomAccessStatus
  pendingParticipants: RoomParticipantWithUser[]
}

export const Meeting: React.FC<Props> = ({ room, myParticipant, access, pendingParticipants }) => {
  const [blueseaConfig, setBlueseaConfig] = useState<BlueseaSession>()
  const [joined, setJoined] = useState(false)
  const [roomParticipant, setRoomParticipant] = useState<RoomParticipant | null>(myParticipant)

  const senders = useMemo(() => {
    return [BlueseaSenders.audio, BlueseaSenders.video, BlueseaSenders.screen_audio, BlueseaSenders.screen_video]
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

  useSharedUserMedia('mic_device')
  useSharedUserMedia('camera_device')
  useSharedDisplayMedia('screen_device')

  return (
    <MediaDeviceProvider>
      {blueseaConfig && roomParticipant && joined ? (
        <BlueseaSessionProvider
          logLevel={LogLevel.WARN}
          gateways={blueseaConfig.gateway}
          room={blueseaConfig.room}
          peer={blueseaConfig.peer}
          token={blueseaConfig.token}
          autoConnect={false}
          mixMinusAudio={{ mode: MixMinusMode.AllAudioStreams, elements: createAudio }}
          senders={senders}
          receivers={{ audio: 0, video: 5 }}
        >
          <MeetingProvider room={room} roomParticipant={roomParticipant} pendingParticipantsList={pendingParticipants}>
            <MainSection room={room} myParticipant={roomParticipant} />
          </MeetingProvider>
        </BlueseaSessionProvider>
      ) : (
        <PrepareSection
          room={room}
          onJoinMeeting={() => {
            setJoined(true)
          }}
          setRoomParticipant={setRoomParticipant}
          setBlueseaConfig={setBlueseaConfig}
          myParticipant={roomParticipant}
          roomAccess={access}
        />
      )}
    </MediaDeviceProvider>
  )
}
