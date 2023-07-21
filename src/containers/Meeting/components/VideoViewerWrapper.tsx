import { Avatar } from 'antd'
import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote, VideoViewer } from 'bluesea-media-react-sdk'
import { FC } from 'react'
import { ParticipatingUser } from '@/contexts'

type Props = {
  stream?: MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer
  priority: number
  user?: ParticipatingUser
  isFullScreen?: boolean
}

export const VideoViewerWrapper: FC<Props> = ({ stream, priority, user, isFullScreen }) => {
  return stream ? (
    <VideoViewer className="w-full h-full object-cover" stream={stream} priority={priority} />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      {/**
       * TODO: Add animation when user talking
       * Asign: @minh
       */}
      {/* <div className="scale-up-center absolute w-20 h-20 bg-green-500 bg-opacity-25 rounded-full" /> */}
      <Avatar src={user?.image} size={isFullScreen ? 120 : 64} className="bg-primary border-none">
        {user?.name?.charAt(0)}
      </Avatar>
    </div>
  )
}
