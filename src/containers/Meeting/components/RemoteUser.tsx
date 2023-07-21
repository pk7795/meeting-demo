import { VideoViewerWrapper } from './VideoViewerWrapper'
import { Col } from 'antd'
import { usePeerRemoteStream } from 'bluesea-media-react-sdk'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'
import { ParticipatingUser } from '@/contexts'
import { usePeerRemoteStreamActive } from '@/hooks'
import { BlueseaSenders, BlueseaStreamPriority } from '@/lib/consts'

type Props = {
  user: ParticipatingUser
}

export const RemoteUser = ({ user }: Props) => {
  const audioStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.audio.name)
  const videoStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.video.name)

  return (
    <Col span={24} md={8} lg={6} key={user.name}>
      <div className="w-full h-44 relative">
        <VideoViewerWrapper stream={videoStream} priority={BlueseaStreamPriority.SmallVideo} />
        <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
          {user.name}
        </div>
        <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
          <Icon icon={audioStream ? <MicIcon size={12} /> : <MicOffIcon size={12} />} />
        </div>
      </div>
    </Col>
  )
}
