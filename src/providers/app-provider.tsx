'use client'

import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import dynamic from 'next/dynamic'
import { ReactQueryProvider } from './react-query-provider'
import { RecoilProvider } from './recoil-provider'

type Props = {
  children: React.ReactNode
}

const ThemeProvider = dynamic(() => import('./theme-provider').then((mod) => mod.ThemeProvider), { ssr: false })

export const AppProvider: React.FC<Props> = ({ children }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ReactQueryProvider>
          <RecoilProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </RecoilProvider>
        </ReactQueryProvider>
      </ThemeProvider>
      <Toaster />
    </>
  )
}
