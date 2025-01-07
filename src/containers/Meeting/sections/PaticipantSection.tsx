'use client'

import { UserType } from '../constants'
import { useMeetingParticipantsList, usePendingParticipants } from '../contexts'
import { Avatar, Modal, Select, Space, Typography } from 'antd'
import { isEmpty, map } from 'lodash'
import { MailPlusIcon, PlusIcon, XIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room, UserRole, UserStatus } from '@prisma/client'
import { inviteToRoom, rejectParticipant } from '@/app/actions'
import { ButtonIcon, useApp } from '@/components'
import { supabase } from '@/config'
import { MeetingParticipant } from '@/types/types'

type Props = {
  room: Partial<Room> | null
  onClose: () => void
  sendAcceptJoinRequest: (participantId: string, type: UserType) => void
}

export const PaticipantSection: React.FC<Props> = ({ room, onClose, sendAcceptJoinRequest }) => {
  const { data: session } = useSession()
  const params = useParams()
  const { message } = useApp()
  const paticipantsList = useMeetingParticipantsList()
  const [pendingParticipants, delPendingParticipant] = usePendingParticipants()
  const [, startTransitionAccept] = useTransition()
  const [, startTransitionReject] = useTransition()
  const [openModalInvites, setOpenModalInvites] = useState(false)
  const [inviteEmail, setInviteEmail] = useState<string[]>([])
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

  const isRoomOwner = useMemo(() => {
    return room?.ownerId === session?.user.id
  }, [session?.user.id, room?.ownerId])

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
        data: map(inviteEmail, (i) => ({
          passcode: params?.passcode as string,
          email: i,
        })),
      }).then(() => {
        message.success('Invite successfully')
        setOpenModalInvites(false)
        setInviteEmail([])
      })
    })
  }, [inviteEmail, message, params?.passcode])

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 border-b dark:border-[#232C3C] flex items-center font-bold px-4 justify-between">
        <span className="dark:text-gray-200 text-gray-900">Paticipants ({paticipantsList?.length})</span>
        <ButtonIcon icon={<XIcon size={16} />} onClick={onClose} />
      </div>
      <div className="border-b dark:border-[#232C3C] flex flex-col items-start font-bold p-4">
        <ButtonIcon
          size="middle"
          type="primary"
          icon={<PlusIcon size={16} />}
          onClick={() => setOpenModalInvites(true)}
        >
          Invite user
        </ButtonIcon>
        {isRoomOwner && !isEmpty(pendingParticipants) && (
          <>
            <div className="text-sm dark:text-gray-200 text-gray-900 mt-4 mb-2">
              Pending requests ({pendingParticipants?.length})
            </div>
            {map(pendingParticipants, (p) => (
              <div className="flex items-center justify-between mb-2 last:mb-0 w-full" key={p.id}>
                <Space>
                  <Avatar src={p.user?.image}>{p.name?.charAt(0)}</Avatar>
                  <div className="text-gray-400">{p.name}</div>
                </Space>
                <Space>
                  <ButtonIcon size="small" type="default" onClick={() => onReject(p)}>
                    Reject
                  </ButtonIcon>
                  <ButtonIcon size="small" type="primary" onClick={() => onAccept(p)} className="mr-2">
                    Accept
                  </ButtonIcon>
                </Space>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <Scrollbars className="h-full dark:bg-[#1D2431] bg-white">
          <div className="h-full p-2">
            {map(paticipantsList, (p) => (
              <div className="flex items-center mb-2 last:mb-0" key={p.id}>
                <div className="relative">
                  <Avatar src={p.user?.image}>{p.name?.charAt(0)}</Avatar>
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: renderUserStatus(p) }}
                  />
                </div>
                <div className="ml-2 text-gray-400">{p.name}</div>
              </div>
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
          value={inviteEmail}
          onChange={(value) => setInviteEmail(value)}
        />
      </Modal>
    </div>
  )
}
