'use client'

import { UserType } from '@/lib/constants'
import { Modal, Select, Space, Typography } from 'antd'
import { isEmpty, map } from 'lodash'
import { MailPlusIcon, MicIcon, MicOffIcon, PlusIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room, UserRole, UserStatus } from '@prisma/client'
import { inviteToRoom, rejectParticipant } from '@/app/actions'
import { supabase } from '@/config'
import { MeetingParticipant } from '@/types/types'
import { useAudioMixerSpeaking } from '@/hooks/use-audio-mixer-speaking'
import { useRemoteAudioTracks } from '@atm0s-media-sdk/react-hooks'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/components/ui/sidebar'
import { toast } from 'sonner'
import { usePendingParticipants, useCurrentParticipant, useMeetingParticipantsList } from '@/contexts/meeting/meeting-provider'

type Props = {
  room: Partial<Room> | null
  sendAcceptJoinRequest: (participantId: string, type: UserType) => void
}

export const ParticipantSection: React.FC<Props> = ({ room, sendAcceptJoinRequest }) => {
  const { data: session } = useSession()
  const params = useParams()
  const baseUrl = window.location.origin
  const meetingLink = `${baseUrl}/${params?.passcode}`
  const participantsList = useMeetingParticipantsList()
  const [pendingParticipants, delPendingParticipant] = usePendingParticipants()
  const [, startTransitionAccept] = useTransition()
  const [, startTransitionReject] = useTransition()
  const [openModalInvites, setOpenModalInvites] = useState(false)
  const [inviteEmails, setInviteEmail] = useState<string[]>([])
  const [isPendingInviteToRoom, startTransitionInviteToRoom] = useTransition()
  const [isLoadingAvailableInvites, startTransitionAvailableInvites] = useTransition()
  const [inviteOptions, setInviteOptions] = useState<
    {
      id: string
      name: string | null
      email: string | null
      emailVerified: Date | null
      image: string | null
      role: UserRole
      status: UserStatus
      createdAt: Date
      updatedAt: Date
    }[]
  >([])
  const currentParticipant = useCurrentParticipant()
  const isRoomOwner = useMemo(() => {
    return room?.ownerId === session?.user.id
  }, [session?.user.id, room?.ownerId])

  const { toggleSidebar } = useSidebar()

  const onAccept = useCallback(
    (participant: MeetingParticipant) => {
      startTransitionAccept(() => {
        const userType = participant.user ? UserType.User : UserType.Guest
        sendAcceptJoinRequest(participant.id, userType)
        delPendingParticipant(participant.id)
      })
    },
    [delPendingParticipant, sendAcceptJoinRequest]
  )

  const onReject = useCallback(
    (participant: MeetingParticipant) => {
      startTransitionReject(() => {
        try {
          rejectParticipant(participant.id)
        } catch (error) {
          //
        }
        delPendingParticipant(participant.id)
      })
    },
    [delPendingParticipant]
  )

  const getAvailableInvites = useCallback(async () => {
    const users = supabase
      .from('User')
      .select('id, name, email, emailVerified, image, role, status, createdAt, updatedAt')
      .not('id', 'eq', session?.user?.id)
    const { data, error } = await users
    if (error) {
      console.log(error)
      return []
    }
    return data
  }, [session?.user?.id])

  useEffect(() => {
    if (openModalInvites) {
      startTransitionAvailableInvites(() => {
        getAvailableInvites().then((res) => {
          setInviteOptions(res)
        })
      })
    }
  }, [getAvailableInvites, openModalInvites])

  const onInvite = useCallback(() => {
    startTransitionInviteToRoom(() => {
      inviteToRoom({
        data: map(inviteEmails, (i) => ({
          passcode: params?.passcode as string,
          email: i,
          senderName: currentParticipant.name,
          meetingLink,
          accessToken: session?.chat.accessToken as string,
        })),
      }).then(() => {
        toast.success('Invite successfully')
        setOpenModalInvites(false)
        setInviteEmail([])
      })
    })
  }, [inviteEmails, params?.passcode, currentParticipant, meetingLink, session?.chat.accessToken])

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 border-b dark:border-[#293042] flex items-center font-bold px-4 justify-between">
        <span className="text-foreground">Participants ({participantsList?.length})</span>
        <Button variant={"ghost"} size={"icon"} onClick={() => toggleSidebar("participant")}>
          <XIcon size={16} />
        </Button>
      </div>
      <div className="border-b dark:border-[#232C3C] flex flex-col items-start font-bold p-4">
        <Button
          variant={"secondary"}
          size="full"
          className={'rounded-lg [&_svg]:!size-full bg-[#D3D9F0] dark:bg-[#1D2431] dark:text-gray-200 text-gray-900'}
          onClick={() => setOpenModalInvites(true)}
        >
          <PlusIcon size={16} />
          Invite user
        </Button>
        {isRoomOwner && !isEmpty(pendingParticipants) && (
          <>
            <div className="text-sm dark:text-gray-200 text-gray-900 mt-4 mb-2">
              Pending requests ({pendingParticipants?.length})
            </div>
            {map(pendingParticipants, (p) => {
              const name = p.user?.name || p.name || ""
              const avatar = p.user?.image || ""
              const firstLetter = name.charAt(0).toUpperCase()
              return (
                <div className="flex items-center justify-between mb-2 last:mb-0 w-full" key={p.id}>
                  <Space>
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="rounded-full">{firstLetter}</AvatarFallback>
                    </Avatar>
                    <div className="text-gray-400">{p.name}</div>
                  </Space>
                  <Space>
                    <Button
                      variant={'link'}
                      onClick={() => {
                        onReject(p)
                      }}
                    >
                      <p className='text-sm text-muted-foreground'>Deny</p>
                    </Button>
                    <Button
                      variant="blue"
                      size={"sm"}
                      onClick={() => {
                        onAccept(p)
                      }}
                    >
                      Admit
                    </Button>
                  </Space>
                </div>
              )
            })}
          </>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <Scrollbars className="h-full bg-backgroundV2">
          <div className="h-full p-3">
            {map(participantsList, (p) => (
              <ParticipantList key={p.id} participant={p} />
            ))}
          </div>
        </Scrollbars>
      </div>
      <Modal
        title="Invite"
        open={openModalInvites}
        onCancel={() => {
          setOpenModalInvites(false)
          setInviteEmail([])
        }}
        onOk={onInvite}
        closable={false}
        okButtonProps={{
          loading: isPendingInviteToRoom,
        }}
        destroyOnClose
        centered
        getContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
      >
        <Typography.Paragraph className="dark:text-gray-400 mb-2">
          Invite people to join this meeting
        </Typography.Paragraph>
        <Select
          mode="tags"
          id="select"
          loading={isLoadingAvailableInvites}
          size="large"
          className="w-full text-[#6B7280]"
          placeholder="Enter email"
          suffixIcon={<MailPlusIcon size={16} color="#6B7280" />}
          notFoundContent={null}
          options={map(inviteOptions, (user) => ({
            label: user.email,
            value: user.email,
          }))}
          value={inviteEmails}
          onChange={(value) => setInviteEmail(value)}
        />
      </Modal>
    </div>
  )
}
const ParticipantList = ({ participant }: { participant: MeetingParticipant }) => {
  const name = participant.user?.name || participant.name
  const avatar = participant.user?.image
  const firstLetter = name.charAt(0).toUpperCase()
  const { speaking } = useAudioMixerSpeaking(participant.id)
  const audioTracks = useRemoteAudioTracks(participant.id)
  const renderUserStatus = useCallback((participant: MeetingParticipant) => {
    if (participant.meetingStatus?.online) {
      if (participant.meetingStatus?.joining === 'prepare-meeting') {
        return '#FBBF24'
      }
      if (participant.meetingStatus?.joining === 'meeting') {
        return '#10B981'
      }
    } else {
      return '#F87171'
    }
  }, [])
  return (
    <div className="flex items-center justify-between mb-2 last:mb-0 w-full">
      <div className="flex items-center mb-2 last:mb-0">
        <div className="relative items-center flex gap-2">
          <Avatar className="h-10 w-10 rounded-full">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="rounded-full">{firstLetter}</AvatarFallback>
          </Avatar>
          <div
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
            style={{ backgroundColor: renderUserStatus(participant) }}
          />
        </div>
        <div className="ml-2 text-gray-400">{participant.name}</div>
      </div>
      {!participant.is_me && audioTracks.length !== 0 && <MicIcon
        size={16}
        className={speaking ? "text-green-500" : "text-gray-400"}
      />}
      {!participant.is_me && audioTracks.length === 0 && <MicOffIcon
        size={16}
        className={"text-red-400"}
      />}
    </div>
  )
}