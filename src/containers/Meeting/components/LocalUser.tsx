import { ViewerWapper } from '.'
import { BlueseaSenders } from '../constants'
import { MeetingParticipant } from '../contexts'
import { Stream } from '../types'
import { useAudioLevelProducer, usePublisher, usePublisherState } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Icon } from '@/components'

type Props = {
  participant: MeetingParticipant
  isPinned: boolean
}

const MIN_AUDIO_LEVEL = -50

export const LocalUser = ({ participant, isPinned }: Props) => {
  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const screenPublisher = usePublisher(BlueseaSenders.screen_video)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)
  const [, screenStream] = usePublisherState(screenPublisher)

  const audioLevel = useAudioLevelProducer(micPublisher)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])

  const _renderView = useMemo(() => {
    if (screenStream && !isPinned) {
      return (
        <div>
          <ViewerWapper participant={participant} stream={screenStream as Stream} priority={1000} />
          <div
            className={classNames(
              'w-1/3 absolute top-0 right-0 rounded-bl-lg overflow-hidden aspect-video',
              camStream ? 'block' : 'hidden'
            )}
          >
            <ViewerWapper participant={participant} stream={camStream as Stream} priority={100} />
          </div>
        </div>
      )
    }
    return <ViewerWapper participant={participant} stream={camStream as Stream} priority={100} />
  }, [camStream, isPinned, participant, screenStream])

  return (
    <div className="w-full relative bg-black rounded-lg overflow-hidden aspect-video">
      <div className="rounded-lg overflow-hidden w-full h-full">{_renderView}</div>
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
