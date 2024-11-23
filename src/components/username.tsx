'use client'

import { removeCookie } from '@/lib'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { useRouter } from 'next/navigation'

type Props = {
  username?: RequestCookie
}

export const Username: React.FC<Props> = ({ username }) => {
  const router = useRouter()

  const onLogout = () => {
    removeCookie('username')
    router.push('/settings-username')
  }
  return (
    <>
      Logged in as {username?.value} |{' '}
      <span className="cursor-pointer underline" onClick={onLogout}>
        Logout
      </span>
    </>
  )
}
