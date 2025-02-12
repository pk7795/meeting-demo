'use client'

import { signOut, useSession } from 'next-auth/react'

type Props = {}

export const Username: React.FC<Props> = () => {
  const { data: session } = useSession()
  const user = session?.user
  return (
    <>
      Logged in as {user?.name} |{' '}
      <span
        className="cursor-pointer underline"
        onClick={() => signOut({
          callbackUrl: '/',
        })}>
        Logout
      </span>
    </>
  )
}
