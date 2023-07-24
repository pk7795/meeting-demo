import { BigViewer } from '.'
import { BlueseaSenders } from '../constants'
import { MeetingParticipant } from '../contexts'
import {
  MediaStreamArc,
  StreamConsumer,
  StreamConsumerPair,
  StreamRemote,
  usePublisher,
  usePublisherState,
} from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { FC } from 'react'

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
        <BigViewer
          participant={participant}
          stream={screenStream as MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer}
          priority={1000}
          isScreenShare
        />
      </div>
      <div className={classNames('w-full h-full', !screenStream ? 'block' : 'hidden')}>
        <BigViewer
          participant={participant}
          stream={camStream as MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer}
          micStream={micStream}
          priority={100}
        />
      </div>
    </>
  )
}
