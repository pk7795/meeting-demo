import { BigViewer } from '.'
import { BlueseaSenders, BlueseaStreamPriority, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelMix } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { FC, useMemo } from 'react'
import { usePeerRemoteStreamActive } from '@/hooks'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const RemoteBigViewer: FC<Props> = ({ participant }) => {
  const camStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.screen_video.name)
  const audioLevel = useAudioLevelMix(participant.id!, BlueseaSenders.audio.name)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])

  return (
    <>
      <div className={classNames('w-full h-full', screenStream ? 'block' : 'hidden')}>
        <BigViewer
          participant={participant}
          stream={screenStream as Stream}
          priority={BlueseaStreamPriority.BigVideo}
          isScreenShare
          isTalking={isTalking}
        />
      </div>
      <div className={classNames('w-full h-full', !screenStream ? 'block' : 'hidden')}>
        <BigViewer
          participant={participant}
          stream={camStream as Stream}
          micStream={micStream}
          priority={BlueseaStreamPriority.BigVideo}
          isTalking={isTalking}
        />
      </div>
    </>
  )
}
