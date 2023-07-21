'use client'

import { Modal, Select, Space, Typography } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import {
  CopyIcon,
  MailPlusIcon,
  MessageCircleIcon,
  MicIcon,
  MicOffIcon,
  PlusIcon,
  ScreenShareIcon,
  VideoIcon,
  VideoOffIcon,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { css } from '@emotion/css'
import { IconPlayerRecordFilled } from '@tabler/icons-react'
import { inviteToRoom } from '@/app/actions'
import { OneUserInvite } from '@/app/meeting/[passcode]/page'
import { ButtonIcon, Copy, useApp } from '@/components'

type Props = {
  userInvite: OneUserInvite[]
  openChat: boolean
  setOpenChat: (open: boolean) => void
}

export const Actions: React.FC<Props> = ({ userInvite, openChat, setOpenChat }) => {
  const params = useParams()
  const { modal, message } = useApp()
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
  const [mic, setMic] = useState(true)
  const [camera, setCamera] = useState(true)
  const [shareScreen, setShareScreen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [inviteEmail, setInviteEmail] = useState<string[]>([])
  const [isPendingInviteToRoom, startTransitionInviteToRoom] = useTransition()

  const onInvite = useCallback(() => {
    startTransitionInviteToRoom(() => {
      inviteToRoom({
        data: map(inviteEmail, (i) => ({
          passcode: params?.passcode as string,
          email: i,
        })),
      }).then(() => {
        message.success('Invite successfully')
        setOpenModal(false)
        setInviteEmail([])
      })
    })
  }, [inviteEmail, message, params?.passcode])

  const onEndCall = useCallback(() => {
    modal.confirm({
      title: 'Are you sure you want to end this call?',
      okText: 'End Call',
      cancelText: 'Cancel',
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        router.push('/')
      },
    })
  }, [modal, router])

  const classNameModal = css({
    '.ant-modal-content': {
      backgroundColor: '#121825',
    },
    '.ant-select-selector': {
      backgroundColor: '#121825 !important',
      borderColor: '#3A4250 !important',
    },
    '.ant-select-selection-placeholder': {
      color: '#6B7280 !important',
    },
    '.ant-select-selection-item': {
      color: '#D1D5DB !important',
      backgroundColor: '#000 !important',
    },
    '.anticon.anticon-close svg': {
      color: '#fff !important',
    },
  })

  return (
    <div className="flex items-center justify-center h-16 bg-[#17202E] border-t border-t-[#232C3C]">
      <div className="flex items-center justify-between w-full px-6">
        <Space>
          <Copy text={params?.code as string}>
            <div className="border border-[#3A4250] bg-[#28303E] rounded-lg flex items-center px-4 h-8 cursor-pointer">
              <Typography.Paragraph ellipsis className="text-sm mb-0 mr-2 text-white w-[100px]">
                {params?.passcode}
              </Typography.Paragraph>
              <CopyIcon size={16} color="#D1D5DB" />
            </div>
          </Copy>
          <ButtonIcon
            icon={<PlusIcon size={16} />}
            size="middle"
            type="primary"
            className="border border-[#3A4250] bg-[#28303E] shadow-none text-xs px-6"
            onClick={() => setOpenModal(true)}
          >
            Invite
          </ButtonIcon>
        </Space>
        <Space>
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames('shadow-none border border-[#3A4250]', mic ? 'bg-primary' : 'bg-red-500')}
            onClick={() => setMic(!mic)}
            icon={mic ? <MicIcon size={16} color="#FFFFFF" /> : <MicOffIcon size={16} color="#FFFFFF" />}
            tooltip="Mute/Unmute"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames('shadow-none border border-[#3A4250]', camera ? 'bg-primary' : 'bg-red-500')}
            onClick={() => setCamera(!camera)}
            icon={camera ? <VideoIcon size={16} color="#FFFFFF" /> : <VideoOffIcon size={16} color="#FFFFFF" />}
            tooltip="Start/Stop Camera"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames('shadow-none border border-[#3A4250]', !shareScreen ? 'bg-[#28303E]' : 'bg-primary')}
            onClick={() => setShareScreen(!shareScreen)}
            icon={<ScreenShareIcon size={16} color="#FFFFFF" />}
            tooltip="Share Screen"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames(
              'shadow-none border border-[#3A4250]',
              !recording ? 'bg-[#28303E]' : 'bg-red-500 bg-opacity-30'
            )}
            onClick={() => setRecording(!recording)}
            icon={<IconPlayerRecordFilled size={16} className={!recording ? 'text-white' : 'text-red-500'} />}
            tooltip="Record"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames('shadow-none border border-[#3A4250]', !openChat ? 'bg-[#28303E]' : 'bg-primary')}
            onClick={() => setOpenChat(!openChat)}
            icon={<MessageCircleIcon size={16} color="#FFFFFF" />}
            tooltip="Chat"
          />
        </Space>
        <div>
          <ButtonIcon
            size="middle"
            type="primary"
            className="bg-red-500 shadow-none text-xs px-6 ml-6"
            onClick={onEndCall}
          >
            Leave Meeting
          </ButtonIcon>
        </div>
      </div>
      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={onInvite}
        maskClosable={false}
        closable={false}
        className={classNameModal}
        cancelButtonProps={{
          className: 'bg-transparent border-none text-white',
        }}
        okButtonProps={{
          loading: isPendingInviteToRoom,
        }}
        destroyOnClose
        centered
      >
        <Select
          mode="tags"
          id="select"
          dropdownStyle={{
            backgroundColor: '#121825 !important',
          }}
          size="large"
          className="w-full text-[#6B7280]"
          placeholder="Enter email"
          suffixIcon={<MailPlusIcon size={16} color="#6B7280" />}
          notFoundContent={null}
          options={map(userInvite, (user) => ({
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
