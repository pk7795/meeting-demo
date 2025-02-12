export enum RoomAccessStatus {
  JOINED = 'JOINED',
  PENDING = 'PENDING', // Waiting for host to approve
  NEED_ASK = 'NEED_ASK', // Need to ask host to join
}
export enum UserType {
  Guest = 'guest',
  User = 'user',
}