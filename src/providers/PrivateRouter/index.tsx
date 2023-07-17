'use server'

import { Authenticate } from '..'
import { includes } from 'lodash'
import { ReactNode } from 'react'
import { UserRole } from '@prisma/client'
import { Result } from '@/components'
import { getSessionUser } from '@/lib'

type Props = {
    children?: ReactNode
    role: UserRole[]
}

export const PrivateRouter: React.FC<Props> = async ({ children, role }) => {
    const session = await getSessionUser()
    if (!includes(role, session?.role)) {
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <Result status="403" title="403" subTitle="Sorry, you are not authorized to access this page." />
            </div>
        )
    }

    return <Authenticate>{children}</Authenticate>
}
