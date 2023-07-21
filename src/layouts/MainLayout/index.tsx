'use client'

import { ReactNode } from 'react'
import { Header } from '@/components'

type Props = {
  children?: ReactNode
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="pt-16">
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <div className="container m-auto px-6">
          <Header />
        </div>
      </div>
      {children}
    </div>
  )
}
