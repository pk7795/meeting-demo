'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'

type Props = {
  children: React.ReactNode
}

export * from './nav-user'

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-background peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
        <div className="flex flex-1 flex-col">{children}</div>
      </main>
    </SidebarProvider>
  )
}
