import { NewRoom } from '@/containers'
import { cookies } from 'next/headers'

export default async function NewRoomScreen() {
  const username = (await cookies()).get('username')
  return <NewRoom username={username} />
}
