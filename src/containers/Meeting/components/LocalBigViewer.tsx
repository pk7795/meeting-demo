import { BigViewer } from '.'
import { Atm0sSenders, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelMix, usePublisher, usePublisherState } from '@8xff/atm0s-media-react'
import { FC, useMemo } from 'react'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const LocalBigViewer: FC<Props> = ({ participant }) => {
  const camPublisher = usePublisher(Atm0sSenders.video)
  const micPublisher = usePublisher(Atm0sSenders.audio)
  const screenPublisher = usePublisher(Atm0sSenders.screen_video)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)
  const [, screenStream] = usePublisherState(screenPublisher)
  const audioLevel = useAudioLevelMix(participant.id!, Atm0sSenders.audio.name)
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
