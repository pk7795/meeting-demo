'use client'

import { generateToken } from '@/app/actions/token'
import { Layout } from '@/layouts'
import { useUser } from '@clerk/nextjs'
import { LoaderCircleIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

type Props = {}

export const Invite: React.FC<Props> = ({}) => {
  const params = useParams()
  const { user } = useUser()
  const userId = user?.id

  const router = useRouter()

  const onGenerateToken = useCallback(async () => {
    const room = params.room as string
    const token = await generateToken(room, userId as string)
    return router.push(`/${room}?gateway=0&peer=${userId}&token=${token}`)
  }, [params.room, router, userId])

  useEffect(() => {
    if (userId) {
      onGenerateToken()
    }
  }, [onGenerateToken, params.room, router, userId])

  return (
    <Layout>
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
      </div>
    </Layout>
  )
}
