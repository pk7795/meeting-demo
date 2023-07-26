import { ViewerWapper } from '.'
import { BlueseaSenders } from '../constants'
import { MeetingParticipant } from '../contexts'
import { Stream } from '../types'
import classNames from 'classnames'
import { MicIcon, MicOffIcon, PinIcon } from 'lucide-react'
import { FC, useMemo } from 'react'
import { Icon } from '@/components'
import { usePeerRemoteStreamActive } from '@/hooks'

type Props = {
  participant: MeetingParticipant
  isPinned: boolean
}

export const RemoteUser: FC<Props> = ({ participant, isPinned }) => {
  const camStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.audio.name)
  const screenStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.screen_video.name)

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
        {isPinned && <Icon className="mr-1" icon={<PinIcon size={12} fill="#fff" />} />}
        {participant.name}
      </div>
      <div className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center bg-black bg-opacity-25">
        <Icon icon={micStream ? <MicIcon size={16} /> : <MicOffIcon size={16} />} />
      </div>
    </div>
  )
}
