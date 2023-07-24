import { BlueseaSenders } from '../constants'
import { MeetingParticipant } from '../contexts'
import { Avatar } from 'antd'
import { useAudioLevelProducer, usePublisher, usePublisherState, VideoViewer } from 'bluesea-media-react-sdk'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Icon } from '@/components'

type Props = {
  participant: MeetingParticipant
}

const MIN_AUDIO_LEVEL = -50

export const LocalUser = ({ participant }: Props) => {
  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)

  const audioLevel = useAudioLevelProducer(micPublisher)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])

  return (
    <div className="w-full relative bg-black rounded-lg overflow-hidden aspect-video">
      <div className="rounded-lg overflow-hidden w-full h-full">
        {camStream ? (
          <VideoViewer className="w-full h-full object-cover" stream={camStream} priority={100} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <Avatar src={participant.user?.image} size={50} className="bg-primary border-none">
              {participant.name?.charAt(0)}
            </Avatar>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg">
        {participant.name}
      </div>
      <div className="absolute bottom-0 right-0 p-2 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon
          icon={micStream ? <MicIcon size={16} color={isTalking ? '#84cc16' : '#ffffff'} /> : <MicOffIcon size={16} />}
        />
      </div>
    </div>
  )
}
