'use client'

import { useRouter } from 'next/navigation'
import { getCookie, removeCookie } from '@repo/ui/lib/cookies'

export const Username = () => {
  const router = useRouter()
  const username = getCookie('username')

  const onLogout = () => {
    removeCookie('username')
    router.push('/settings-username')
  }
  return (
    <>
      Logged in as {username} |{' '}
      <span className="underline cursor-pointer" onClick={onLogout}>
        Logout
      </span>
    </>
  )
}
