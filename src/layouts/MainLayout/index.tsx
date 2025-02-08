'use client'

import { ReactNode } from 'react'
import { Header } from '@/components'
import { SidebarProvider } from '@/components/ui/sidebar'

type Props = {
  children?: ReactNode
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-slate-950">
        <div className="container m-auto px-6">
          <Header />
        </div>
      </div>
      <SidebarProvider>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarProvider>
    </div>
  )
}
