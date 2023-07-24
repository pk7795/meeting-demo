import { MeetingParticipant } from '../contexts'
import { VideoViewerWrapper } from './VideoViewerWrapper'
import { useAudioLevelProducer, usePublisher, usePublisherState } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'
import { BlueseaSenders } from '@/lib/consts'

type Props = {
  participant: MeetingParticipant
  isFullScreen?: boolean
}

export const LocalUser = ({ participant, isFullScreen }: Props) => {
  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const [, camPublisherStream] = usePublisherState(camPublisher)
  const [, micPublisherStream] = usePublisherState(micPublisher)
  const audioLevel = useAudioLevelProducer(micPublisher)

  // TODO: create function isAudible()
  const minAudioLevel = -50

  const sizeIcon = isFullScreen ? 24 : 16

  return (
    <div
      className={classNames(
        'w-full relative bg-black rounded-lg overflow-hidden',
        !isFullScreen ? 'aspect-video' : 'h-full',
        typeof audioLevel === 'number' && audioLevel > minAudioLevel ? 'ring-2 ring-yellow-500' : ''
      )}
    >
      <VideoViewerWrapper
        stream={camPublisherStream}
        priority={100}
        participant={participant}
        isFullScreen={isFullScreen}
      />
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg">
        {participant.name}
      </div>
      <div className="absolute bottom-0 right-0 p-2 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon icon={micPublisherStream ? <MicIcon size={sizeIcon} /> : <MicOffIcon size={sizeIcon} />} />
      </div>
    </div>
  )
}
