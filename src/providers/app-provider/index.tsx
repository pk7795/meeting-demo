'use client'

import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ReactNode, useState } from 'react'
import { RecoilRoot } from 'recoil'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

const ThemeProvider = dynamic(() => import('@/providers/theme-provider').then((mod) => mod.ThemeProvider), { ssr: false })
type Props = {
  children?: ReactNode
}

export const AppProvider: React.FC<Props> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark">
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryClientProvider>
        </RecoilRoot>
      </ThemeProvider>
      <Toaster />
    </SessionProvider>
  )
}
