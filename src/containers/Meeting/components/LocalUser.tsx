import { ViewerWapper } from '.'
import { Atm0sSenders, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelProducer, usePublisher, usePublisherState } from '@8xff/atm0s-media-react'
import classNames from 'classnames'
import { HandIcon, MicIcon, MicOffIcon, PinIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Icon } from '@/components'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
  isPinned: boolean
  layout: 'GRID' | 'LEFT'
  participantCount?: number
}

export const LocalUser = ({ participant, isPinned, layout, participantCount }: Props) => {
  const camPublisher = usePublisher(Atm0sSenders.video)
  const micPublisher = usePublisher(Atm0sSenders.audio)
  const screenPublisher = usePublisher(Atm0sSenders.screen_video)
  const [, camStream] = usePublisherState(camPublisher)
  const [, micStream] = usePublisherState(micPublisher)
  const [, screenStream] = usePublisherState(screenPublisher)
  console.log("micStream", micStream);
  console.log("---------_---------------camStream", camStream);

  const audioLevel = useAudioLevelProducer(micPublisher)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])
  const isHandRaised = participant?.meetingStatus?.handRaised

  const _renderView = useMemo(() => {
    if (screenStream && !isPinned) {
      return (
        <div>
          <ViewerWapper participant={participant} stream={screenStream as Stream} priority={1000} participantCount={participantCount} />
          <div
            className={classNames(
              'w-1/3 absolute top-0 right-0 rounded-bl-lg overflow-hidden aspect-video',
              camStream ? 'block' : 'hidden'
            )}
          >
            <ViewerWapper participant={participant} stream={camStream as Stream} priority={100} participantCount={participantCount} />
          </div>
        </div>
      )
    }
    return <ViewerWapper participant={participant} stream={camStream as Stream} priority={100} participantCount={participantCount} />
  }, [camStream, isPinned, participant, screenStream])

  // useEffect(() => {
  //   console.log("micPublisher", micPublisher);
  //   const handler = (level: number) => {
  //     console.log("audio_level", level);

  //   };
  //   micPublisher.on('audio_level', handler);
  //   return () => {
  //     micPublisher.off('audio_level', handler);
  //   };
  // }, [micPublisher])
  return (
    <div
      className={classNames(
        'w-full relativerounded-lg overflow-hidden aspect-video ', layout !== 'GRID' ? '' : 'h-full',
        isHandRaised ? 'ring-4 ring-yellow-400' : '',
        participantCount === 1 && layout == "GRID" ? "" : "bg-black"
      )}
    >
      <div className="rounded-lg overflow-hidden w-full h-full">{_renderView}</div>
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white flex items-center">
        {isPinned && <Icon className="mr-1" icon={<PinIcon size={12} fill="#fff" />} />}
        {participant.name}
        {isHandRaised && <Icon className="ml-1" icon={<HandIcon size={18} />} />}
      </div>
      <div className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center bg-black bg-opacity-25">
        <Icon
          icon={micStream ? <MicIcon size={16} color={isTalking ? '#84cc16' : '#ffffff'} /> : <MicOffIcon size={16} />}
        />
      </div>
    </div>
  )
}
