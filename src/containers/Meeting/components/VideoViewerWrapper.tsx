import { Avatar } from 'antd'
import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote, VideoViewer } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { FC } from 'react'
import { ParticipatingUser } from '@/contexts'

type Props = {
  stream?: MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer
  priority: number
  user?: ParticipatingUser
  openMic: boolean
}

export const VideoViewerWrapper: FC<Props> = ({ stream, priority, user, openMic }) => {
  return stream ? (
    <VideoViewer className="w-full h-full object-cover" stream={stream} priority={priority} />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      {/**
       * TODO: Add animation when user talking
       * Asign: @minh
       */}
      {/* <div className="scale-up-center absolute w-20 h-20 bg-green-500 bg-opacity-25 rounded-full" /> */}
      <Avatar
        src={user?.image}
        size={64}
        className={classNames('bg-primary border-2', openMic ? 'border-green-500' : 'border-red-500')}
      >
        {user?.name?.charAt(0)}
      </Avatar>
    </div>
  )
}
