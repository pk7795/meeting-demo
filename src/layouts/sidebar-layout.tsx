'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'

type Props = {
    children: React.ReactNode
}

export * from './nav-user'

export const SidebarLayout: React.FC<Props> = ({ children }) => {
    return (
        <SidebarProvider>
            <main className="relative flex min-h-svh flex-1 flex-col overflow-hidden bg-background peer-data-[variant=floating]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=floating]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=floating]:ml-2 md:peer-data-[variant=floating]:ml-0 md:peer-data-[variant=floating]:rounded-xl md:peer-data-[variant=floating]:shadow">
                <div className="flex flex-1 flex-col p-2 ">{children}</div>
            </main>
            <AppSidebar />
        </SidebarProvider>
    )
}
