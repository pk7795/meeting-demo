import { MediaStreamArc, StreamConsumer, StreamConsumerPair, StreamRemote, VideoViewer } from 'bluesea-media-react-sdk'

type Props = {
  stream?: MediaStream | MediaStreamArc | StreamRemote | StreamConsumerPair | StreamConsumer
  priority: number
}

export const VideoViewerWrapper = ({ stream, priority }: Props) => {
  return stream ? (
    <VideoViewer className="rounded-lg w-full h-full" stream={stream} priority={priority} />
  ) : (
    <div
      className="rounded-lg w-full h-full"
      style={{
        backgroundColor: 'gray',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  )
}
