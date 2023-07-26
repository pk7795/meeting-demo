import { MeetingParticipant } from '../contexts'
import { MicStream, Stream } from '../types'
import { Avatar } from 'antd'
import { VideoViewer } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { FC } from 'react'
import { Icon } from '@/components'

type Props = {
  participant: MeetingParticipant
  stream: Stream
  micStream?: MicStream
  priority?: number
  isScreenShare?: boolean
}

export const BigViewer: FC<Props> = ({ participant, stream, micStream, priority, isScreenShare }) => {
  const classNameVideo = classNames('w-full', isScreenShare ? '' : 'h-full object-cover')
  return (
    <div className="w-full relative bg-black rounded-lg overflow-hidden h-full flex items-center">
      {stream ? (
        <VideoViewer className={classNameVideo} stream={stream} priority={priority} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Avatar src={participant.user?.image} size={120} className="bg-primary border-none">
            {participant.name?.charAt(0)}
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg">
        {participant.name}
      </div>
      {!isScreenShare && (
        <div className="absolute bottom-0 right-0 p-2 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
          <Icon icon={micStream ? <MicIcon size={24} /> : <MicOffIcon size={24} />} />
        </div>
      )}
    </div>
  )
}
