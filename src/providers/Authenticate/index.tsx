'use client'

import { Spin } from 'antd'
import { signOut, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'
import { UserStatus } from '@prisma/client'
import { Result } from '@/components'

type Props = {
    children?: ReactNode
}

export const Authenticate: React.FC<Props> = ({ children }) => {
    const { status, data } = useSession()
    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut({
                callbackUrl: '/auth/login',
            })
        }
    }, [status])

    if (status == 'loading') {
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <Spin spinning />
            </div>
        )
    }

    return (
        <div className="relative">
            {status === 'authenticated' && data?.user?.status === UserStatus.Actived && children}
            {status === 'authenticated' && data?.user?.status !== UserStatus.Actived && (
                <Result
                    status="403"
                    title="403"
                    subTitle="Your account is not activated. Please contact the administrator."
                />
            )}
        </div>
    )
}
