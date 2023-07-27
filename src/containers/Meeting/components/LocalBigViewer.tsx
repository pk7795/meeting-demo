import { BigViewer } from '.'
import { BlueseaSenders } from '../constants'
import { Stream } from '../types'
import { usePublisher, usePublisherState } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { FC } from 'react'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
}

export const LocalBigViewer: FC<Props> = ({ participant }) => {
  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const screenPublisher = usePublisher(BlueseaSenders.screen_video)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)
  const [, screenStream] = usePublisherState(screenPublisher)

  return (
    <>
      <div className={classNames('w-full h-full', screenStream ? 'block' : 'hidden')}>
        <BigViewer participant={participant} stream={screenStream as Stream} priority={1000} isScreenShare />
      </div>
      <div className={classNames('w-full h-full', !screenStream ? 'block' : 'hidden')}>
        <BigViewer participant={participant} stream={camStream as Stream} micStream={micStream} priority={100} />
      </div>
    </>
  )
}
