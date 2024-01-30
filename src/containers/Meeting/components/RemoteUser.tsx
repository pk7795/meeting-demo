import { ViewerWapper } from '.'
import { Atm0sSenders, MIN_AUDIO_LEVEL } from '../constants'
import { Stream } from '../types'
import { useAudioLevelMix } from '@8xff/atm0s-media-react'
import classNames from 'classnames'
import { throttle } from 'lodash'
import { HandIcon, MicIcon, MicOffIcon, PinIcon } from 'lucide-react'
import { FC, useEffect, useMemo, useRef } from 'react'
import { Icon } from '@/components'
import { usePeerRemoteStreamActive } from '@/hooks'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
  isPinned: boolean
  raiseRingTone: HTMLAudioElement
}

export const RemoteUser: FC<Props> = ({ participant, isPinned, raiseRingTone }) => {
  const camStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, Atm0sSenders.screen_video.name)
  const audioLevel = useAudioLevelMix(participant.id!, Atm0sSenders.audio.name)
  const isTalking = useMemo(() => typeof audioLevel === 'number' && audioLevel > MIN_AUDIO_LEVEL, [audioLevel])
  const isHandRaised = participant?.meetingStatus?.handRaised

  const throttled = useRef(
    throttle(
      () => {
        return raiseRingTone.play()
      },
      1000 * 3,
      { trailing: false, leading: true }
    )
  )

  useEffect(() => {
    if (isHandRaised) {
      throttled.current()
    }
  }, [isHandRaised])

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
    <div
      className={classNames(
        'w-full relative bg-black rounded-lg overflow-hidden aspect-video',
        isHandRaised ? 'ring-4 ring-yellow-400' : ''
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
