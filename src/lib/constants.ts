export enum RoomAccessStatus {
  JOINED = 'JOINED',
  PENDING = 'PENDING', // Waiting for host to approve
  NEED_ASK = 'NEED_ASK', // Need to ask host to join
}
export const ErmisStreamPriority = {
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
