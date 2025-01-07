import { ContentHint, StreamKinds } from '@8xff/atm0s-media-react'

export const Atm0sSenders = {
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

export const Atm0sStreamPriority = {
  SmallVideo: 100,
  BigVideo: 500,
  ScreenShare: 1000,
}

export enum UserType {
  Guest = 'guest',
  User = 'user',
}

// Minimum audio level to consider audible
export const MIN_AUDIO_LEVEL = -40
