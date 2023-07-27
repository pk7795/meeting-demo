import { usePinnedParticipant } from '../contexts'
import { MicStream, Stream } from '../types'
import { Avatar } from 'antd'
import { VideoViewer } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { MicIcon, MicOffIcon, PinIcon, PinOffIcon } from 'lucide-react'
import { FC, useMemo } from 'react'
import { css } from '@emotion/css'
import { Icon } from '@/components'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
  stream: Stream
  micStream?: MicStream
  priority?: number
  isScreenShare?: boolean
}

export const BigViewer: FC<Props> = ({ participant, stream, micStream, priority, isScreenShare }) => {
  const classNameVideo = classNames('w-full', isScreenShare ? '' : 'h-full object-cover')
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()

  const classNameViewer = css({
    '.__btn-hover': {
      display: 'none',
      transition: 'all 0.3s ease',
    },
    '&:hover': {
      '.__btn-hover': {
        display: 'flex',
      },
    },
  })

  const isPinned = useMemo(
    () => participant.id === pinnedParticipant?.p?.id,
    [participant.id, pinnedParticipant?.p?.id]
  )

  return (
    <div
      className={classNames(
        'w-full relative bg-black rounded-lg overflow-hidden h-full flex items-center',
        classNameViewer
      )}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-50 cursor-pointer w-12 h-12 rounded-full items-center justify-center __btn-hover"
        onClick={() => {
          if (isPinned) {
            setPinnedParticipant(null)
            return
          }
          setPinnedParticipant({
            p: participant,
            force: true,
          })
        }}
      >
        {isPinned ? <PinOffIcon size={16} className="text-white" /> : <PinIcon size={16} className="text-white" />}
      </div>
      {stream ? (
        <VideoViewer playsInline className={classNameVideo} stream={stream} priority={priority} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Avatar src={participant.user?.image} size={120} className="bg-primary border-none">
            <span className="text-2xl">{participant.name?.charAt(0)}</span>
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white">{participant.name}</div>
      {!isScreenShare && (
        <div className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center bg-black bg-opacity-25">
          <Icon icon={micStream ? <MicIcon size={16} /> : <MicOffIcon size={16} />} />
        </div>
      )}
    </div>
  )
}
