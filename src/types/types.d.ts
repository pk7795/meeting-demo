export type RoomWithParticipants = {
  participants: {
    id: string
    name: string
    image: string
  }
} & Partial<Room>
