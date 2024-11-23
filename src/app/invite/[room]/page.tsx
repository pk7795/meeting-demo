import { Invite } from '@/containers'
import { cookies } from 'next/headers'

export default async function InviteScreen() {
  const username = (await cookies()).get('username')
  return <Invite username={username} />
}
