import { StreamKinds } from 'bluesea-media-react-sdk'

export const BlueseaSenders = {
  video: { kind: StreamKinds.VIDEO, name: 'video_main', simulcast: true },
  audio: { kind: StreamKinds.AUDIO, name: 'audio_main' },
}

export const BlueseaStreamPriority = {
  SmallVideo: 100,
  BigVideo: 500,
  ScreenShare: 1000,
}
