import { BigViewer } from '.'
import { BlueseaSenders, BlueseaStreamPriority, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { Switch } from 'antd'
import { useAudioLevelMix } from 'bluesea-media-react-sdk'
import { FC, useMemo, useState } from 'react'
import { usePeerRemoteStreamActive } from '@/hooks'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const RemoteBigViewer: FC<Props> = ({ participant }) => {
  const [forceHigh, setForceHigh] = useState(false)
  const camStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.screen_video.name)
  const audioLevel = useAudioLevelMix(participant.id!, BlueseaSenders.audio.name)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])

  return (
    <>
      <div className="w-full h-full">
        {screenStream && (
          <Switch
            className="absolute top-2 left-2 z-10"
            checkedChildren="High"
            unCheckedChildren="Auto"
            checked={forceHigh}
            onChange={setForceHigh}
          />
        )}
        <BigViewer
          participant={participant}
          stream={screenStream ? screenStream : (camStream as Stream)}
          micStream={micStream}
          priority={screenStream ? BlueseaStreamPriority.ScreenShare : BlueseaStreamPriority.BigVideo}
          isTalking={isTalking}
          forceHighQuality={screenStream && forceHigh}
        />
      </div>
    </>
  )
}
