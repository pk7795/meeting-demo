'use client'

import { Input, Space, Typography } from 'antd'
import { HashIcon, PlusIcon } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LOGO_SHORT } from '@public'
import { ButtonIcon } from '@/components'

export default function IndexJoinMeeting() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/new-meeting'
  const [code, setCode] = useState('')

  const onJoin = useCallback(() => {
    router.push(`/meeting/${code}`)
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#f9fafa]">
      <div className="flex flex-col lg:flex-row items-center justify-center px-6 z-50 max-w-[25rem]">
        <div className="my-8 px-4">
          <img src={LOGO_SHORT} alt="" className="w-8" />
          <h1 className="my-4 text-xl">Welcome to Bluesea</h1>
          <Typography.Paragraph>
            Bluesea live is a service that provides secure, high-quality video calling and meetings to anyone, on any
            device.
          </Typography.Paragraph>
          <Space>
            <ButtonIcon
              type="primary"
              size="middle"
              icon={<PlusIcon size={16} />}
              onClick={() => signIn('github', { callbackUrl })}
            >
              New meeting
            </ButtonIcon>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              prefix={<HashIcon size={16} />}
              suffix={
                <ButtonIcon className="text-primary" disabled={!code} onClick={onJoin}>
                  Join
                </ButtonIcon>
              }
              placeholder="Enter code"
            />
          </Space>
        </div>
      </div>
    </div>
  )
}
