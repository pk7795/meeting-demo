import { BigViewer } from '.'
import { BlueseaSenders } from '../constants'
import { Stream } from '../types'
import { Switch } from 'antd'
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
      <div className="w-full h-full">
        <BigViewer
          participant={participant}
          stream={screenStream || (camStream as Stream)}
          micStream={micStream}
          isScreenShare={!!screenStream}
        />
      </div>
    </>
  )
}
