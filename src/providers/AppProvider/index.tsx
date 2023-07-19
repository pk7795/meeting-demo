'use client'

import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ReactNode, useState } from 'react'
import { RecoilRoot } from 'recoil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const AntdProvider = dynamic(() => import('@/providers/AntdProvider'), {
  ssr: false,
})

type AppProviderProps = {
  children?: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <AntdProvider>{children}</AntdProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </SessionProvider>
  )
}
