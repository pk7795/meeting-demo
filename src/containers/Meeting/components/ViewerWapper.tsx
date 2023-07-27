import { Stream } from '../types'
import { Avatar } from 'antd'
import { VideoViewer } from 'bluesea-media-react-sdk'
import { FC } from 'react'
import { MeetingParticipant } from '@/types/types'

type Props = {
  participant: MeetingParticipant
  stream: Stream
  priority?: number
}

export const ViewerWapper: FC<Props> = ({ participant, stream, priority }) => {
  return (
    <>
      {stream ? (
        <VideoViewer className="w-full h-full object-cover" stream={stream} priority={priority} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Avatar src={participant.user?.image} size={50} className="bg-primary border-none">
            {participant.name?.charAt(0)}
          </Avatar>
        </div>
      )}
    </>
  )
}
