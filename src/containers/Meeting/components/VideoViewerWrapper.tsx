import { MeetingParticipant } from '../contexts'
import { Avatar } from 'antd'
import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote, VideoViewer } from 'bluesea-media-react-sdk'
import { FC } from 'react'

type Props = {
  stream?: MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer
  priority: number
  participant: MeetingParticipant
  isFullScreen?: boolean
}

export const VideoViewerWrapper: FC<Props> = ({ stream, priority, participant, isFullScreen }) => {
  return stream ? (
    <VideoViewer className="w-full h-full object-cover" stream={stream} priority={priority} />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Avatar src={participant.user?.image} size={isFullScreen ? 120 : 64} className="bg-primary border-none">
        {participant.name?.charAt(0)}
      </Avatar>
    </div>
  )
}
