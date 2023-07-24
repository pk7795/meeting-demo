import { BlueseaSenders } from '../constants'
import { MeetingParticipant } from '../contexts'
import { Avatar } from 'antd'
import { VideoViewer } from 'bluesea-media-react-sdk'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { FC } from 'react'
import { Icon } from '@/components'
import { usePeerRemoteStreamActive } from '@/hooks'

type Props = {
  participant: MeetingParticipant
  priority?: number
  isFullScreen?: boolean
}

export const RemoteUser: FC<Props> = ({ participant }: Props) => {
  const camStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.video.name)
  const micStream = usePeerRemoteStreamActive(participant.id!, BlueseaSenders.audio.name)

  return (
    <div className="w-full relative bg-black rounded-lg overflow-hidden aspect-video">
      <div className="rounded-lg overflow-hidden w-full h-full">
        {camStream ? (
          <VideoViewer className="w-full h-full object-cover" stream={camStream} priority={100} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <Avatar src={participant.user?.image} size={50} className="bg-primary border-none">
              {participant.name?.charAt(0)}
            </Avatar>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg">
        {participant.name}
      </div>
      <div className="absolute bottom-0 right-0 p-2 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon icon={micStream ? <MicIcon size={16} /> : <MicOffIcon size={16} />} />
      </div>
    </div>
  )
}
