'use client'

import {
  Sidebar,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChatSection, ParticipantSection } from '@/containers/meeting/sections'
import { UserType } from '@/lib/constants'
import { RoomPopulated } from '@/types/types'
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  sendAcceptJoinRequest: (id: string, type: UserType) => void
  room: RoomPopulated
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
