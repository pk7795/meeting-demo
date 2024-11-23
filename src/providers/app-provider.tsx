'use client'

import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ReactQueryProvider } from './react-query-provider'
import { RecoilProvider } from './recoil-provider'
import { ThemeProvider } from './theme-provider'

type Props = {
  children: React.ReactNode
}

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
