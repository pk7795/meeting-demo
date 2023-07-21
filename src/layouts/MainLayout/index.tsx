'use client'

import { ReactNode } from 'react'
import { Header } from '@/components'

type Props = {
  children?: ReactNode
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="pt-16 bg-white dark:bg-slate-950 min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="container m-auto px-6">
          <Header />
        </div>
      </div>
      {children}
    </div>
  )
}
