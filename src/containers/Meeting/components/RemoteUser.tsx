import { VideoViewerWrapper } from './VideoViewerWrapper'
import { isEmpty } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'
import { ParticipatingUser } from '@/contexts'
import { usePeerRemoteStreamActive } from '@/hooks'
import { BlueseaSenders, BlueseaStreamPriority } from '@/lib/consts'

type Props = {
  user: ParticipatingUser
  priority?: number
}

export const RemoteUser = ({ user, priority = BlueseaStreamPriority.SmallVideo }: Props) => {
  const audioStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.audio.name)
  const videoStream = usePeerRemoteStreamActive(user.id!, BlueseaSenders.video.name)

  return (
    <div className="w-full aspect-video relative bg-black rounded-lg overflow-hidden">
      <VideoViewerWrapper stream={videoStream} priority={priority} user={user} openMic={!isEmpty(audioStream)} />
      <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
        {user.name}
      </div>
      <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon icon={audioStream ? <MicIcon size={12} /> : <MicOffIcon size={12} />} />
      </div>
    </div>
  )
}
