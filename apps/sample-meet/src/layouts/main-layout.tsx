'use client'

import { ChangeTheme } from '@repo/ui/providers/index'

type Props = {
  children: React.ReactNode
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      {children}
      <div className="absolute bottom-3 right-4 z-50">
        <ChangeTheme />
      </div>
    </div>
  )
}
