import { Button, notification, Space } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useEffect } from 'react'
import { RoomInvite } from '@prisma/client'
import { supabase } from '@/config/supabase'

export const GlobalContext = createContext({} as any)

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [api, contextHolder] = notification.useNotification()

  // TODO: Move this outside of context and expose a hook instead (hint: use DataContainer for events)
  const openNotification = useCallback(
    (opts: {
      message: string
      description: string
      buttons: {
        confirm: string
        onConfirm: () => void
        cancel: string
        onCancel: () => void
      }
    }) => {
      const key = 'open' + Date.now()
      const btn = (
        <Space>
          <Button type="link" size="small" onClick={opts.buttons.onCancel}>
            {opts.buttons.cancel}
          </Button>
          <Button type="primary" size="small" onClick={opts.buttons.onConfirm}>
            {opts.buttons.confirm}
          </Button>
        </Space>
      )
      api.open({
        message: opts.message,
        description: opts.description,
        btn,
        key,
      })
    },
    [api]
  )

  // Handle broadcasted invitations
  const onInvitationReceived = useCallback(
    async (invite: RoomInvite) => {
      const room = await supabase.from('Room').select('id, name, passcode').eq('id', invite.roomId).single()

      openNotification({
        message: 'You have been invited to a room',
        description: 'You have been invited to join the room ' + room?.data?.name,
        buttons: {
          confirm: 'Join',
          onConfirm: () => {
            router.push('/' + room?.data?.passcode)
          },
          cancel: 'Cancel',
          onCancel: () => api.destroy(),
        },
      })
    },
    [api, openNotification, router]
  )

  useEffect(() => {
    if (session) {
      const roomInviteSubscription = supabase
        .channel('room-invite-noti:' + session!.user!.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'RoomInvite',
            filter: 'email=eq.' + session!.user!.email,
          },
          (payload: { new: RoomInvite }) => onInvitationReceived(payload.new)
        )
        .subscribe()

      return () => {
        roomInviteSubscription.unsubscribe()
      }
    }
  }, [onInvitationReceived, session])

  return (
    <GlobalContext.Provider value={{}}>
      {contextHolder}
      {children}
    </GlobalContext.Provider>
  )
}
