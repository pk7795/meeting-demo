import { BigViewer } from '.'
import { Atm0sSenders, Atm0sStreamPriority, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelMix } from '@8xff/atm0s-media-react'
import { Switch } from 'antd'
import classNames from 'classnames'
import { FC, useMemo, useState } from 'react'
import { usePeerRemoteStreamActive } from '@/hooks'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const RemoteBigViewer: FC<Props> = ({ participant }) => {
  const [forceHigh, setForceHigh] = useState(false)
  const camStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.screen_video.name)
  const audioLevel = useAudioLevelMix(participant.id!, Atm0sSenders.audio.name)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])

  return (
    <>
      <div className="w-full h-full">
        {screenStream && (
          <Switch
            className={classNames('absolute bottom-2 right-2 z-50', forceHigh ? 'bg-red-500' : 'bg-blue-500')}
            checkedChildren="HD"
            unCheckedChildren="Auto"
            checked={forceHigh}
            onChange={setForceHigh}
          />
        )}
        <BigViewer
          participant={participant}
          stream={screenStream ? screenStream : (camStream as Stream)}
          micStream={micStream}
          priority={screenStream ? Atm0sStreamPriority.ScreenShare : Atm0sStreamPriority.BigVideo}
          isTalking={isTalking}
          forceHighQuality={screenStream && forceHigh}
        />
      </div>
    </>
  )
}
