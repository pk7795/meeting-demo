'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
// import { NavChanel } from './nav-chanel'
import { NavUser } from './nav-user'
import { ChatSection, ParticipantSection } from '@/containers/Meeting/sections'
import { UserType } from '@/containers/Meeting/constants'
import { RoomPopulated } from '@/types/types'
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  sendAcceptJoinRequest: (id: string, type: UserType) => void
  room: RoomPopulated // hoặc thay any thành type Room nếu đã có định nghĩa
}
export function AppSidebar({ sendAcceptJoinRequest, room, ...props }: AppSidebarProps) {
  const { triggerType } = useSidebar()

  return (
    <Sidebar variant="floating" {...props} side='right'>
      {triggerType == "participant" && <ParticipantSection sendAcceptJoinRequest={sendAcceptJoinRequest} room={room} />}
      {triggerType == "chat" && <ChatSection room={room} />}
    </Sidebar>
  )
}
