import { ContentHint, SenderConfig, StreamKinds } from 'bluesea-media-react-sdk'

export const BlueseaSenders = {
  video: {
    kind: StreamKinds.VIDEO,
    name: 'video_main',
    simulcast: true,
  },
  audio: {
    kind: StreamKinds.AUDIO,
    name: 'audio_main',
  },
  screen_video: {
    kind: StreamKinds.VIDEO,
    name: 'video_screen',
    simulcast: true,
    screen: true,
    content_hint: ContentHint.Detail,
  },
  screen_audio: {
    kind: StreamKinds.AUDIO,
    name: 'audio_screen',
  },
}

export const BlueseaStreamPriority = {
  SmallVideo: 100,
  BigVideo: 500,
  ScreenShare: 1000,
}
