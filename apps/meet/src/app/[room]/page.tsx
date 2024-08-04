import { Room } from './containers'
import { cookies, headers } from 'next/headers'

export default function Page() {
  const headersList = headers()
  const username = cookies().get('username')

  const host = headersList.get('host') // to get domain

  return <Room host={host} username={username} />
}
