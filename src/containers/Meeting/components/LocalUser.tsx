import { VideoViewerWrapper } from './VideoViewerWrapper'
import { usePublisher, usePublisherState } from 'bluesea-media-react-sdk'
import { isEmpty } from 'lodash'
import { MicIcon, MicOffIcon } from 'lucide-react'
import { Icon } from '@/components'
import { ParticipatingUser } from '@/contexts'
import { BlueseaSenders } from '@/lib/consts'

type Props = {
  user: ParticipatingUser
}

export const LocalUser = ({ user }: Props) => {
  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const [, camPublisherStream] = usePublisherState(camPublisher)
  const [, micPublisherStream] = usePublisherState(micPublisher)

  return (
    <div className="w-full aspect-video relative bg-black rounded-lg overflow-hidden">
      <VideoViewerWrapper
        stream={camPublisherStream}
        priority={100}
        user={user}
        openMic={!isEmpty(micPublisherStream)}
      />
      <div className="absolute bottom-0 left-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tr-lg rounded-bl-lg text-xs">
        {user.name}
      </div>
      <div className="absolute bottom-0 right-0 px-2 py-1 text-white bg-[rgba(0,0,0,0.50)] rounded-tl-lg rounded-br-lg">
        <Icon icon={micPublisherStream ? <MicIcon size={12} /> : <MicOffIcon size={12} />} />
      </div>
    </div>
  )
}
