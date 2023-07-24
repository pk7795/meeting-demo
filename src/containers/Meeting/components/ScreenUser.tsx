import {
  MediaStreamArc,
  StreamConsumer,
  StreamConsumerPair,
  StreamRemote,
  usePublisher,
  usePublisherState,
  VideoViewer,
} from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { FC } from 'react'
import { BlueseaSenders } from '@/lib/consts'

type Props = {}

export const ScreenUser: FC<Props> = () => {
  const screenVideoPublisher = usePublisher(BlueseaSenders.screen_video)
  const [, screenPublisherStream] = usePublisherState(screenVideoPublisher)

  return (
    <div className={classNames('w-full relative bg-black rounded-lg overflow-hidden aspect-video')}>
      <VideoViewer
        className="w-full h-full object-cover"
        stream={
          screenPublisherStream as MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer
        }
        priority={1000}
      />
    </div>
  )
}
