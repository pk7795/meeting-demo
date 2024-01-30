import { Stream } from '../types'
import { VideoViewer } from '@8xff/atm0s-media-react'
import { Avatar } from 'antd'
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
        <VideoViewer playsInline className="w-full h-full object-cover" stream={stream} priority={priority} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <Avatar src={participant?.user?.image} size={50} className="bg-primary border-none">
            {participant?.name?.charAt(0)}
          </Avatar>
        </div>
      )}
    </>
  )
}
