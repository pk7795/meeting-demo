import { VideoViewerWrapper } from './VideoViewerWrapper'
import classNames from 'classnames'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'
import { ParticipatingUser } from '@/contexts'
import { usePeerRemoteStreamActive } from '@/hooks'
import { BlueseaSenders, BlueseaStreamPriority } from '@/lib/consts'

type Props = {
  user: ParticipatingUser
  priority?: number
  isFullScreen?: boolean
}

export const RemoteUser = ({ user, priority = BlueseaStreamPriority.SmallVideo, isFullScreen }: Props) => {
  const audioStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.audio.name)
  const videoStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.video.name)

  const sizeIcon = isFullScreen ? 24 : 16

  return (
    <div
      className={classNames(
        'w-full relative bg-black rounded-lg overflow-hidden',
        !isFullScreen ? 'aspect-video' : 'h-full'
      )}
    >
      <VideoViewerWrapper stream={videoStream} priority={priority} user={user} isFullScreen={isFullScreen} />
      <div className="absolute bottom-0 left-0 p-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg">
        {user.name}
      </div>
      <div className="absolute bottom-0 right-0 p-2 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon icon={audioStream ? <MicIcon size={sizeIcon} /> : <MicOffIcon size={sizeIcon} />} />
      </div>
    </div>
  )
}
