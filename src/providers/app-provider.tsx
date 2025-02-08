'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { JotaiProvider } from '@/providers/jotai-provider'
import { ReactQueryProvider } from '@/providers/react-query-provider'
import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Toaster } from 'sonner'
type Props = {
  children: React.ReactNode
}

const ThemeProvider = dynamic(() => import('./theme-provider').then((mod) => mod.ThemeProvider), { ssr: false })

export const AppProvider: React.FC<Props> = ({ children }) => {
  return (
    <>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ReactQueryProvider>
            <JotaiProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </JotaiProvider>
          </ReactQueryProvider>
        </ThemeProvider>
        <Toaster />
      </SessionProvider>
    </>
  )
}
