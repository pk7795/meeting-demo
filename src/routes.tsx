import { LayoutDashboardIcon, ListVideoIcon, Settings2Icon, User2Icon } from 'lucide-react'
import { UserRole } from '@prisma/client'

export const routes = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboardIcon size={16} />,
  },
  {
    title: 'Channels',
    href: '/channels',
    icon: <ListVideoIcon size={16} />,
  },
  {
    title: 'Atm0s Config',
    href: '/config',
    icon: <Settings2Icon size={16} />,
    roles: [UserRole.SuperAdmin],
  },
  {
    title: 'Users',
    href: '/users',
    icon: <User2Icon size={16} />,
    roles: [UserRole.SuperAdmin],
  },
]
