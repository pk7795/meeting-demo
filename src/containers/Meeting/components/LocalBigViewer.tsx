import { BigViewer } from '.'
import { ErmisSenders, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelMix, usePublisher, usePublisherState } from 'ermis-media-react-sdk'
import { FC, useMemo } from 'react'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const LocalBigViewer: FC<Props> = ({ participant }) => {
  const camPublisher = usePublisher(ErmisSenders.video)
  const micPublisher = usePublisher(ErmisSenders.audio)
  const screenPublisher = usePublisher(ErmisSenders.screen_video)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)
  const [, screenStream] = usePublisherState(screenPublisher)
  const audioLevel = useAudioLevelMix(participant.id!, ErmisSenders.audio.name)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])
  return (
    <>
      <div className="w-full h-full">
        <BigViewer
          participant={participant}
          stream={screenStream || (camStream as Stream)}
          micStream={micStream}
          isScreenShare={!!screenStream}
          isTalking={isTalking}
        />
      </div>
    </>
  )
}
