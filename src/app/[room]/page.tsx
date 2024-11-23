import { Room } from '@/containers'
import { cookies, headers } from 'next/headers'

export default async function Page() {
  const headersList = headers()
  const username = (await cookies()).get('username')

  const host = (await headersList).get('host')

  return <Room host={host} username={username} />
}
