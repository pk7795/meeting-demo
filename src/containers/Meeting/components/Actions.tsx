'use client'

import { useAudioInput, useSelectedCam, useSelectedMic, useVideoInput } from '../contexts'
import { Modal, Popover, Select, Space, Typography } from 'antd'
import {
  useActions,
  useAudioLevelProducer,
  usePublisher,
  usePublisherState,
  useSharedUserMedia,
} from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { find, map } from 'lodash'
import {
  CameraIcon,
  CopyIcon,
  HashIcon,
  MailPlusIcon,
  MessageCircleIcon,
  MicIcon,
  MicOffIcon,
  MoreHorizontalIcon,
  PhoneOffIcon,
  PlusIcon,
  Settings2Icon,
  VideoIcon,
  VideoOffIcon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { inviteToRoom } from '@/app/actions'
import { OneUserInvite } from '@/app/meeting/[passcode]/page'
import { ButtonIcon, Copy, Icon, useApp } from '@/components'
import { supabase } from '@/config/supabase'
import { useDevice } from '@/hooks'
import { BlueseaSenders } from '@/lib/consts'

type Props = {
  openChat: boolean
  setOpenChat: (open: boolean) => void
}

export const Actions: React.FC<Props> = ({ openChat, setOpenChat }) => {
  const { data: user } = useSession()
  const actions = useActions()
  const params = useParams()
  const { modal, message } = useApp()
  const router = useRouter()
  const [openModalInvites, setOpenModalInvites] = useState(false)
  const [openModalSettings, setOpenModalSettings] = useState(false)
  const [inviteEmail, setInviteEmail] = useState<string[]>([])
  const [isPendingInviteToRoom, startTransitionInviteToRoom] = useTransition()
  const [isLoadingAvailableInvites, startTransitionAvailableInvites] = useTransition()
  const [inviteOptions, setInviteOptions] = useState<OneUserInvite[]>([])
  const { isMobile } = useDevice()

  const camPublisher = usePublisher(BlueseaSenders.video)
  const micPublisher = usePublisher(BlueseaSenders.audio)
  const [, micPublisherStream] = usePublisherState(micPublisher)
  const [, camPublisherStream] = usePublisherState(camPublisher)

  const [micStream, , micStreamChanger] = useSharedUserMedia('mic_device')
  const [camStream, , camStreamChanger] = useSharedUserMedia('camera_device')

  const [videoInput] = useVideoInput()
  const [selectedVideoInput, setSelectedVideoInput] = useSelectedCam()

  const [audioInput] = useAudioInput()
  const [selectedAudioInput, setSelectedAudioInput] = useSelectedMic()

  const audioLevel = useAudioLevelProducer(micPublisher)
  useEffect(() => {
    actions.connect()
  }, [actions])
  useEffect(() => {
    micPublisher.switchStream(micStream)
  }, [micPublisher, micStream])

  useEffect(() => {
    camPublisher.switchStream(camStream)
  }, [camPublisher, camStream])

  // TODO: refactor or move to actions
  const getAvailableInvites = useCallback(async () => {
    const users = supabase
      .from('User')
      .select('id, name, email, emailVerified, image, role, status, createdAt, updatedAt')
      .not('id', 'eq', user?.user?.id)
    const { data, error } = await users
    if (error) {
      console.log(error)
      return []
    }
    return data
  }, [user?.user?.id])

  useEffect(() => {
    if (openModalInvites) {
      startTransitionAvailableInvites(() => {
        getAvailableInvites().then((res) => {
          setInviteOptions(res)
        })
      })
    }
  }, [getAvailableInvites, openModalInvites])

  const toggleMic = useCallback(() => {
    if (micPublisherStream) {
      micStreamChanger(undefined)
    } else {
      micStreamChanger({
        audio: {
          deviceId: selectedAudioInput?.deviceId,
        },
      })
    }
  }, [micPublisherStream, micStreamChanger, selectedAudioInput?.deviceId])

  const toggleCam = useCallback(() => {
    if (camPublisherStream) {
      camStreamChanger(undefined)
    } else {
      camStreamChanger({
        video: {
          deviceId: selectedVideoInput?.deviceId,
        },
      })
    }
  }, [camPublisherStream, camStreamChanger, selectedVideoInput?.deviceId])

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

  const onEndCall = useCallback(() => {
    modal.confirm({
      title: 'Are you sure you want to end this call?',
      okText: 'End Call',
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        router.push('/')
      },
    })
  }, [modal, router])

  return (
    <div className="flex items-center justify-center h-16 bg-white dark:bg-[#17202E] border-t dark:border-t-[#232C3C]">
      <div className="flex items-center justify-between w-full px-6">
        {!isMobile && (
          <Space>
            <Copy text={params?.passcode as string}>
              <div className="border dark:border-[#3A4250] bg-[#F9FAFB] dark:bg-[#28303E] rounded-lg flex items-center px-4 h-8 cursor-pointer">
                <Typography.Paragraph ellipsis className="text-sm mb-0 mr-2 dark:text-white w-[100px]">
                  {params?.passcode}
                </Typography.Paragraph>
                <CopyIcon size={16} color="#D1D5DB" />
              </div>
            </Copy>
            <ButtonIcon
              icon={<PlusIcon size={16} />}
              size="middle"
              type="primary"
              className="border dark:border-[#3A4250] dark:bg-[#28303E] shadow-none text-xs px-6"
              onClick={() => setOpenModalInvites(true)}
            >
              Invite
            </ButtonIcon>
          </Space>
        )}
        <Space>
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames(
              'shadow-none border dark:border-[#3A4250]',
              micPublisherStream ? 'bg-primary' : 'bg-red-500',
              typeof audioLevel === 'number' && audioLevel > -40 && 'ring-2 ring-green-500'
            )}
            onClick={toggleMic}
            icon={micPublisherStream ? <MicIcon size={16} color="#FFFFFF" /> : <MicOffIcon size={16} color="#FFFFFF" />}
            tooltip="Mute/Unmute"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames(
              'shadow-none border dark:border-[#3A4250]',
              camPublisherStream ? 'bg-primary' : 'bg-red-500'
            )}
            onClick={toggleCam}
            icon={
              camPublisherStream ? <VideoIcon size={16} color="#FFFFFF" /> : <VideoOffIcon size={16} color="#FFFFFF" />
            }
            tooltip="Start/Stop Camera"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className={classNames(
              'shadow-none border border-gray-200 dark:border-[#3A4250]',
              !openChat ? 'dark:bg-[#28303E] bg-[#F9FAFB]' : 'bg-primary'
            )}
            onClick={() => setOpenChat(!openChat)}
            icon={
              <MessageCircleIcon
                size={16}
                className={classNames('dark:text-white text-primary_text', openChat ? 'text-white' : '')}
              />
            }
            tooltip="Chat"
          />
          <ButtonIcon
            size="large"
            type="primary"
            className="shadow-none border border-gray-200 dark:border-[#3A4250] dark:bg-[#28303E] bg-[#F9FAFB]"
            onClick={() => setOpenModalSettings(true)}
            icon={<Settings2Icon size={16} className="dark:text-white text-primary_text" />}
            tooltip="Settings"
          />
          {isMobile && (
            <Popover
              placement="top"
              overlayInnerStyle={{
                padding: 8,
              }}
              content={
                <div>
                  <Copy text={params?.code as string}>
                    <div
                      className={classNames(
                        'h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 dark:text-white'
                      )}
                    >
                      <HashIcon size={16} />
                      <div className="text-sm ml-2">Copy passcode</div>
                    </div>
                  </Copy>
                  <div
                    onClick={() => setOpenModalInvites(true)}
                    className={classNames('h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 dark:text-white')}
                  >
                    <PlusIcon size={16} />
                    <div className="text-sm ml-2">Invite</div>
                  </div>
                </div>
              }
              trigger="hover"
            >
              <ButtonIcon
                size="large"
                type="primary"
                className="shadow-none border border-gray-200 dark:border-[#3A4250] dark:bg-[#28303E] bg-[#F9FAFB]"
                icon={<MoreHorizontalIcon size={16} className="dark:text-white text-primary_text" />}
              />
            </Popover>
          )}
        </Space>
        <div>
          <ButtonIcon size="large" type="primary" className="bg-red-500 shadow-none text-xs px-6" onClick={onEndCall}>
            {!isMobile ? 'Leave Meeting' : <PhoneOffIcon size={24} className="text-white" />}
          </ButtonIcon>
        </div>
      </div>
      <Modal
        title="Invite"
        open={openModalInvites}
        onCancel={() => {
          setOpenModalInvites(false)
          setInviteEmail([])
        }}
        onOk={onInvite}
        maskClosable={false}
        closable={false}
        okButtonProps={{
          loading: isPendingInviteToRoom,
        }}
        destroyOnClose
        centered
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
      <Modal
        title="Settings"
        open={openModalSettings}
        onCancel={() => setOpenModalSettings(false)}
        footer={false}
        destroyOnClose
        centered
      >
        <div className="mb-4">
          <Select
            size="large"
            suffixIcon={<Icon icon={<CameraIcon color="#0060FF" />} />}
            options={map(videoInput, (d) => ({
              label: d.label,
              value: d.deviceId,
            }))}
            value={selectedVideoInput?.deviceId}
            onChange={(value) => {
              setSelectedVideoInput(find(videoInput, (d) => d.deviceId === value))
              camStreamChanger({
                video: {
                  deviceId: value,
                },
              })
            }}
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Select
            size="large"
            suffixIcon={<Icon icon={<MicIcon color="#0060FF" />} />}
            options={map(audioInput, (d) => ({
              label: d.label,
              value: d.deviceId,
            }))}
            value={selectedAudioInput?.deviceId}
            onChange={(value) => {
              setSelectedAudioInput(find(audioInput, (d) => d.deviceId === value))
              micStreamChanger({
                audio: {
                  deviceId: value,
                },
              })
            }}
            className="w-full"
          />
        </div>
      </Modal>
    </div>
  )
}
