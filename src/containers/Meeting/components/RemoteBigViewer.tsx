import { BigViewer } from '.'
import { BlueseaSenders, BlueseaStreamPriority } from '../constants'
import { MeetingParticipant } from '../contexts'
import { Stream } from '../types'
import classNames from 'classnames'
import { FC } from 'react'
import { usePeerRemoteStreamActive } from '@/hooks'

type Props = {
  participant: MeetingParticipant
}

export const RemoteBigViewer: FC<Props> = ({ participant }) => {
  const camStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.screen_video.name)

  return (
    <>
      <div className={classNames('w-full h-full', screenStream ? 'block' : 'hidden')}>
        <BigViewer
          participant={participant}
          stream={screenStream as Stream}
          priority={BlueseaStreamPriority.BigVideo}
          isScreenShare
        />
      </div>
      <div className={classNames('w-full h-full', !screenStream ? 'block' : 'hidden')}>
        <BigViewer
          participant={participant}
          stream={camStream as Stream}
          micStream={micStream}
          priority={BlueseaStreamPriority.BigVideo}
        />
      </div>
    </>
  )
}
