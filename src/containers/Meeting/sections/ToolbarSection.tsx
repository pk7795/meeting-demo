'use client'

import { Atm0sSenders } from '../constants'
import {
  useAudioInput,
  useMeetingParticipantsList,
  useMeetingParticipantState,
  usePendingParticipants,
  useReceiveMessage,
  useSelectedCam,
  useSelectedMic,
  useVideoInput,
} from '../contexts'
import {
  useAudioLevelProducer,
  usePublisher,
  usePublisherState,
  useSessionState,
  useSharedDisplayMedia,
  useSharedUserMedia,
} from '@8xff/atm0s-media-react'
import { Badge, Modal, Popover, Select, Space, Typography } from 'antd'
import classNames from 'classnames'
import { find, isEmpty, map } from 'lodash'
import {
  CameraIcon,
  ChevronDown,
  CopyIcon,
  HandIcon,
  HashIcon,
  MessagesSquareIcon,
  MicIcon,
  MicOffIcon,
  MoreHorizontalIcon,
  PenLineIcon,
  PhoneOffIcon,
  ScreenShareIcon,
  Settings2Icon,
  UsersIcon,
  VideoIcon,
  VideoOffIcon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ButtonIcon, Copy, Drawer, Icon, useApp } from '@/components'
import { useDevice } from '@/hooks'
import { useChatChannelContext } from '@/contexts/chat'

type Props = {
  openChat: boolean
  setOpenChat: (open: boolean) => void
  openPaticipant: boolean
  setOpenPaticipant: (open: boolean) => void
  sendEvent: (event: string, data?: any) => void
}

/**
 * TODO: refactor this component
 * Asign: @caohv
 */
export const ToolbarSection: React.FC<Props> = ({
  openChat,
  setOpenChat,
  openPaticipant,
  setOpenPaticipant,
  sendEvent,
}) => {
  const { data: user } = useSession()
  const params = useParams()
  const { modal } = useApp()
  const router = useRouter()
  const [userState, setUserState] = useMeetingParticipantState()
  const [openModalSettings, setOpenModalSettings] = useState(false)
  const [openDrawerWhiteboard, setOpenDrawerWhiteboard] = useState(false)
  const { isMobile } = useDevice()

  const sessionState = useSessionState()
  const camPublisher = usePublisher(Atm0sSenders.video)

  const micPublisher = usePublisher(Atm0sSenders.audio)
  const screenVideoPublisher = usePublisher(Atm0sSenders.screen_video)
  const screenAudioPublisher = usePublisher(Atm0sSenders.screen_audio)
  const [, micPublisherStream] = usePublisherState(micPublisher)
  const [, camPublisherStream] = usePublisherState(camPublisher)
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>camPublisherStream", camPublisherStream);

  const [, screenPublisherStream] = usePublisherState(screenVideoPublisher)

  const [micStream, , micStreamChanger] = useSharedUserMedia('mic_device')
  const [camStream, , camStreamChanger] = useSharedUserMedia('camera_device')
  const [screenStream, , screenStreamChanger] = useSharedDisplayMedia('screen_device')
  const [, setPrvScreenStream] = useState<any>(null)

  const [videoInput] = useVideoInput()
  const [selectedVideoInput, setSelectedVideoInput] = useSelectedCam()

  const [audioInput] = useAudioInput()
  const [selectedAudioInput, setSelectedAudioInput] = useSelectedMic()
  const [pendingParticipants] = usePendingParticipants()
  const [receiveMessage] = useReceiveMessage()
  const participants = useMeetingParticipantsList();
  const chatChannel = useChatChannelContext();
  const audioLevel = useAudioLevelProducer(micPublisher)

  const whiteboardUri = useMemo(
    () => `https://wbo.ophir.dev/boards/bluesea-meeting-${params?.passcode}`,
    [params?.passcode]
  )

  useEffect(() => {
    if (sessionState === 'connected') {
      micPublisher.switchStream(micStream)
    }

  }, [micPublisher, micStream, sessionState])

  useEffect(() => {
    if (sessionState === 'connected') {
      camPublisher.switchStream(camStream)
    }
  }, [camPublisher, camStream, sessionState])

  useEffect(() => {
    if (sessionState === 'connected') {
      screenAudioPublisher.switchStream(screenStream)
    }
  }, [screenAudioPublisher, screenStream, sessionState])

  useEffect(() => {
    if (sessionState === 'connected') {
      screenVideoPublisher.switchStream(screenStream)
      setUserState({ ...userState, screenShare: !!screenStream })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenStream, screenVideoPublisher, setUserState, sessionState])

  const onEndedScreenShare = useCallback(() => {
    screenStreamChanger(undefined)
  }, [screenStreamChanger])

  useEffect(() => {
    screenStream?.stream.getVideoTracks()?.[0]?.addEventListener('ended', onEndedScreenShare)

    return () => {
      screenStream?.stream.getVideoTracks()?.[0]?.removeEventListener('ended', onEndedScreenShare)
    }
  }, [onEndedScreenShare, screenStream?.stream, screenStreamChanger])

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
  }, [micPublisherStream, micStreamChanger, selectedAudioInput])

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

  const toggleScreen = useCallback(() => {
    setPrvScreenStream(screenStream)
    if (screenPublisherStream) {
      screenStreamChanger(undefined)
    } else {
      screenStreamChanger({
        video: {
          frameRate: 5,
          width: {
            max: 1920,
          },
          height: {
            max: 1200,
          },
        },
        audio: true,
      })
    }
  }, [screenPublisherStream, screenStream, screenStreamChanger])

  const toggleRaiseHand = () => {
    if (userState.handRaised) {
      setUserState({ ...userState, handRaised: false })
      sendEvent('interact', { handRaised: false })
    } else {
      setUserState({ ...userState, handRaised: true })
      sendEvent('interact', { handRaised: true })
    }
  }

  const onEndCall = useCallback(() => {
    modal.confirm({
      title: 'Are you sure you want to end this call?',
      okText: 'End Call',
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        // ????? Think about delete chat channel if user is not owner
        // if (participants.length <= 1) {
        //   chatChannel?.delete();
        // }
        router.push('/')
      },
      getContainer: () => document.getElementById('id--fullScreen') as HTMLElement,
    })
  }, [modal, router, participants.length])

  // get meeting url
  const meetingUrl = useMemo(() => {
    const baseUrl = window.location.origin
    return `${baseUrl}/meeting/${params?.passcode}`
  }, [params?.passcode])

  return (
    <div className="flex items-center justify-center h-16 ">
      <div className="flex items-center justify-between w-full px-6">
        {!isMobile && (
          <Copy text={meetingUrl}>
            <div className="border dark:border-[#3A4250] bg-[#F9FAFB] dark:bg-[#28303E] rounded-lg flex items-center px-4 h-8 cursor-pointer">
              <Typography.Paragraph ellipsis className="text-sm mb-0 mr-2 dark:text-white">
                {params?.passcode}
              </Typography.Paragraph>
              <CopyIcon size={16} />
            </div>
          </Copy>
        )}
        <Space>
          <div
            className={classNames(
              'dark:bg-[#28303E] bg-[#F9FAFB] border dark:border-[#3A4250] w-14 h-10 rounded-lg flex items-center relative',
              typeof audioLevel === 'number' && audioLevel > -40 && micPublisherStream && 'ring-2 ring-green-500'
            )}
          >
            <div className="absolute left-3 flex items-center cursor-pointer" onClick={toggleMic}>
              {micPublisherStream ? (
                <MicIcon size={16} className={classNames('dark:text-white text-primary_text')} />
              ) : (
                <MicOffIcon size={16} className={classNames('dark:text-white text-primary_text')} />
              )}
            </div>
            <Popover
              placement="top"
              overlayInnerStyle={{
                padding: 8,
              }}
              getPopupContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
              content={
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
                  className="w-[350px]"
                />
              }
              trigger="click"
            >
              <div className="w-4 h-full flex items-center absolute top-0 right-1 cursor-pointer">
                <Icon icon={<ChevronDown size={16} />} />
              </div>
            </Popover>
          </div>
          <div
            className={classNames(
              'dark:bg-[#28303E] bg-[#F9FAFB] border dark:border-[#3A4250] w-14 h-10 rounded-lg flex items-center relative'
            )}
          >
            <div className="absolute left-3 flex items-center cursor-pointer" onClick={toggleCam}>
              {camPublisherStream ? (
                <VideoIcon size={16} className={classNames('dark:text-white text-primary_text')} />
              ) : (
                <VideoOffIcon size={16} className={classNames('dark:text-white text-primary_text')} />
              )}
            </div>
            <Popover
              placement="top"
              overlayInnerStyle={{
                padding: 8,
              }}
              getPopupContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
              content={
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
                  className="w-[350px]"
                />
              }
              trigger="click"
            >
              <div className="w-4 h-full flex items-center absolute top-0 right-1 cursor-pointer">
                <Icon icon={<ChevronDown size={16} />} />
              </div>
            </Popover>
          </div>
          {!isMobile && (
            <>
              <ButtonIcon
                size="large"
                type="primary"
                className={classNames(
                  'shadow-none border border-gray-200 dark:border-[#3A4250]',
                  !screenPublisherStream ? 'dark:bg-[#28303E] bg-[#F9FAFB]' : 'bg-primary'
                )}
                onClick={toggleScreen}
                icon={
                  <ScreenShareIcon
                    size={16}
                    className={classNames(
                      'dark:text-white text-primary_text',
                      screenPublisherStream ? 'text-white' : ''
                    )}
                  />
                }
                tooltip="Start/Stop Screen Share"
              />
              <ButtonIcon
                size="large"
                type="primary"
                className={classNames(
                  'shadow-none border border-gray-200 dark:border-[#3A4250] dark:bg-[#28303E] bg-[#F9FAFB]'
                )}
                onClick={() => setOpenDrawerWhiteboard(true)}
                icon={<PenLineIcon size={16} className={classNames('dark:text-white text-primary_text')} />}
                tooltip="Whiteboard"
              />
              <ButtonIcon
                size="large"
                type="primary"
                className={classNames(
                  'shadow-none border border-gray-200 dark:border-[#3A4250]',
                  userState.handRaised ? 'bg-primary' : 'dark:bg-[#28303E] bg-[#F9FAFB]'
                )}
                onClick={toggleRaiseHand}
                icon={
                  <HandIcon
                    size={16}
                    className={classNames(
                      'dark:text-white text-primary_text',
                      userState.handRaised ? 'text-white' : ''
                    )}
                  />
                }
                tooltip="Raise Hand"
              />
            </>
          )}
          <Popover
            placement="top"
            overlayInnerStyle={{
              padding: 8,
            }}
            getPopupContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
            content={
              <div>
                <div
                  onClick={() => setOpenModalSettings(true)}
                  className={classNames('h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 dark:text-white')}
                >
                  <Settings2Icon size={16} />
                  <div className="text-sm ml-2">Settings</div>
                </div>
                {isMobile && (
                  <>
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
                      onClick={() => setOpenDrawerWhiteboard(true)}
                      className={classNames(
                        'h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 dark:text-white'
                      )}
                    >
                      <PenLineIcon size={16} />
                      <div className="text-sm ml-2">Whiteboard</div>
                    </div>
                    <div
                      onClick={toggleRaiseHand}
                      className={classNames(
                        'h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 dark:text-white'
                      )}
                    >
                      <HandIcon size={16} />
                      <div className="text-sm ml-2">Raise Hand</div>
                    </div>
                  </>
                )}
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
          <ButtonIcon size="large" type="primary" className="bg-red-500 shadow-none text-xs px-6" onClick={onEndCall}>
            <PhoneOffIcon size={16} className="text-white" />
          </ButtonIcon>
        </Space>
        <Space>
          <Badge dot={!isEmpty(pendingParticipants)}>
            <ButtonIcon
              size="large"
              type="primary"
              className={classNames(
                'shadow-none border border-gray-200 dark:border-[#3A4250]',
                !openPaticipant ? 'dark:bg-[#28303E] bg-[#F9FAFB]' : 'bg-primary'
              )}
              onClick={() => {
                setOpenChat(false)
                setOpenPaticipant(!openPaticipant)
              }}
              icon={
                <UsersIcon
                  size={16}
                  className={classNames('dark:text-white text-primary_text', openPaticipant ? 'text-white' : '')}
                />
              }
              tooltip="Participants"
            />
          </Badge>
          <Badge dot={!!receiveMessage && receiveMessage?.participant?.user?.id !== user?.user.id}>
            <ButtonIcon
              size="large"
              type="primary"
              className={classNames(
                'shadow-none border border-gray-200 dark:border-[#3A4250]',
                !openChat ? 'dark:bg-[#28303E] bg-[#F9FAFB]' : 'bg-primary'
              )}
              onClick={() => {
                setOpenPaticipant(false)
                setOpenChat(!openChat)
              }}
              icon={
                <MessagesSquareIcon
                  size={16}
                  className={classNames('dark:text-white text-primary_text', openChat ? 'text-white' : '')}
                />
              }
              tooltip="Chat"
            />
          </Badge>
        </Space>
      </div>
      <Modal
        title="Settings"
        open={openModalSettings}
        onCancel={() => setOpenModalSettings(false)}
        footer={false}
        destroyOnClose
        centered
        getContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
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
      <Drawer
        title="Whiteboard"
        placement="bottom"
        height="70%"
        open={openDrawerWhiteboard}
        onClose={() => setOpenDrawerWhiteboard(false)}
        destroyOnClose
        getContainer={() => document.getElementById('id--fullScreen') as HTMLElement}
      >
        <iframe src={whiteboardUri} className="w-full h-full" />
      </Drawer>
    </div>
  )
}
