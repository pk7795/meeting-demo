import { NewRoom } from './containers'
import { cookies } from 'next/headers'

export default function NewRoomScreen() {
  const username = cookies().get('username')
  return <NewRoom username={username} />
}
