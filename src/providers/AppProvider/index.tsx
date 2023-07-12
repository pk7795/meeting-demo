'use client'

import { Spin } from 'antd'
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { RecoilRoot } from 'recoil'
import { UserRole, UserStatus } from '@prisma/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const AntdProvider = dynamic(() => import('@/providers/AntdProvider'), {
  ssr: false,
})

const whiteRoutes = '/auth/login'

type PrivateRouterProps = {
  children?: ReactNode
  role: UserRole[]
}

const PrivateRouter: React.FC<PrivateRouterProps> = ({ children, role }) => {
  const pathname = usePathname()
  const { status, data } = useSession()
  const user: any = data?.user

  useEffect(() => {
    if (whiteRoutes !== pathname && status === 'unauthenticated') {
      signOut({
        callbackUrl: '/auth/login',
      })
    }
  }, [pathname, status])

  if (status == 'loading') {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Spin spinning />
      </div>
    )
  } else {
    if (user && whiteRoutes !== pathname) {
      if (role.includes(user?.role)) {
        if (user?.status == UserStatus.Actived) {
          return <div className="relative">{children}</div>
        } else {
          return <div className="flex items-center justify-center h-screen w-screen">Account not actived</div>
        }
      } else {
        return <div className="flex items-center justify-center h-screen w-screen">Permission denied</div>
      }
    } else {
      return <div className="relative">{children}</div>
    }
  }
}

type AppProviderProps = {
  children?: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AntdProvider>
            <PrivateRouter role={[UserRole.Admin, UserRole.SuperAdmin]}>{children}</PrivateRouter>
          </AntdProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </SessionProvider>
  )
}
