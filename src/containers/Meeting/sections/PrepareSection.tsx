import { UserType } from '../constants'
import { useAudioInput, useSelectedCam, useSelectedMic, useVideoInput } from '../contexts'
import { useSharedUserMedia, VideoViewer } from '@8xff/atm0s-media-react'
import { Col, Divider, Input, Row, Select, Space, Spin, Typography } from 'antd'
import classNames from 'classnames'
import { filter, find, map } from 'lodash'
import { CameraIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createRoomParticipantGuestUser, createRoomParticipantLoginUser } from '@/app/actions'
import { ButtonIcon, Icon } from '@/components'
import { supabase } from '@/config/supabase'
import { MainLayout } from '@/layouts'
import { RoomAccessStatus } from '@/lib/constants'
import { randomUUID } from '@/lib/random'
import { RoomPopulated } from '@/types/types'
import { useChatPendingMeetingRoomStatusContext } from '@/contexts/chat'
type Props = {
  onJoinMeeting: () => void
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  setRoomParticipant: (participant: RoomParticipant) => void
  setAtm0sConfig: (config: any) => void
  roomAccess: RoomAccessStatus
}

export const PrepareSection: React.FC<Props> = ({
  room,
  onJoinMeeting,
  setRoomParticipant,
  setAtm0sConfig: setAtm0sConfig,
  roomAccess,
}) => {
  const { data: user, status } = useSession()
  const router = useRouter()

  const [videoInput, setVideoInput] = useVideoInput()
  const [selectedVideoInput, setSelectedVideoInput] = useSelectedCam()

  const [audioInput, setAudioInput] = useAudioInput()
  const [selectedAudioInput, setSelectedAudioInput] = useSelectedMic()

  const [access, setAccess] = useState<RoomAccessStatus | null>(roomAccess)
  const [name, setName] = useState('')

  const [error, setError] = useState(false)

  const [mic, setMic] = useState(false)
  const [camera, setCamera] = useState(false)

  const [, , micStreamChanger] = useSharedUserMedia('mic_device')
  const [camStream, , camStreamChanger] = useSharedUserMedia('camera_device')

  const [isPendingCreateRoomParticipant, startTransitionCreateRoomParticipant] = useTransition()

  const [acceptSubscription, setAcceptSubscription] = useState<RealtimeChannel>()
  const setRoomAccessStatus = useChatPendingMeetingRoomStatusContext();

  const guestUUID = useMemo(() => {
    return randomUUID() + ':' + room.id
  }, [room.id])

  useEffect(() => {
    if (mic) {
      micStreamChanger({
        audio: {
          deviceId: selectedAudioInput?.deviceId,
        },
      })
    } else {
      micStreamChanger(undefined)
    }
  }, [mic, micStreamChanger, selectedAudioInput?.deviceId])

  useEffect(() => {
    if (camera) {
      camStreamChanger({
        video: {
          deviceId: selectedVideoInput?.deviceId
        },
      })
    } else {
      camStreamChanger(undefined)
    }
  }, [camStreamChanger, camera, selectedVideoInput?.deviceId])

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoInput = filter(mediaDevices, ({ kind }) => kind === 'videoinput')
      setVideoInput(videoInput)
      setSelectedVideoInput(videoInput[0])

      const audioInput = filter(mediaDevices, ({ kind }) => kind === 'audioinput')
      setAudioInput(audioInput)
      setSelectedAudioInput(audioInput[0])
    },
    [setAudioInput, setSelectedAudioInput, setSelectedVideoInput, setVideoInput]
  )

  useEffect(() => {
    const askCameraPermission = async (): Promise<MediaStream | null> =>
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

    askCameraPermission()
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices)
      })
      .catch(() => setError(true))
  }, [handleDevices])

  useEffect(() => {
    return () => {
      acceptSubscription && supabase.removeChannel(acceptSubscription)
    }
  }, [acceptSubscription])
  useEffect(() => {
    setRoomAccessStatus(access)

  }, [access])
  const sendJoinRequest = useCallback(
    (id: string, name: string, type: string) => {
      // TODO: Refactor
      const roomChannel = supabase.channel(`room:${room.id}`)
      roomChannel.subscribe((status) => {
        console.log('AYO', status)
        if (status === 'SUBSCRIBED') {
          roomChannel.send({
            type: 'broadcast',
            event: 'ask',
            payload: {
              id,
              name,
              type,
              user: {
                id: user?.user.id,
                name: user?.user.name,
                email: user?.user.image,
              },
            },
          })
          setAccess(RoomAccessStatus.PENDING)
        }
      })
    },
    [room.id, user?.user.id, user?.user.image, user?.user.name]
  )

  const onUserJoin = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      createRoomParticipantLoginUser({
        data: {
          passcode: room.passcode as string,
        },
      }).then(({ peerSession, roomParticipant }) => {
        setRoomParticipant(roomParticipant)
        setAtm0sConfig(peerSession)
        onJoinMeeting()
      })
    })
  }, [onJoinMeeting, room.passcode, setAtm0sConfig, setRoomParticipant])

  const onGuestJoin = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      createRoomParticipantGuestUser({
        data: {
          name,
          passcode: room.passcode as string,
        },
      }).then(({ peerSession, roomParticipant }) => {
        setRoomParticipant(roomParticipant)
        setAtm0sConfig(peerSession)
        onJoinMeeting()
      })
    })
  }, [name, onJoinMeeting, room.passcode, setAtm0sConfig, setRoomParticipant])

  const onJoin = useCallback(() => {
    if (user) {
      onUserJoin()
    } else {
      onGuestJoin()
    }
  }, [onGuestJoin, onUserJoin, user])

  const onAsk = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      if (user) {
        createRoomParticipantLoginUser({
          data: {
            passcode: room.passcode as string,
          },
        }).then(({ peerSession, roomParticipant }) => {
          setRoomParticipant(roomParticipant)
          setAtm0sConfig(peerSession)
          sendJoinRequest(roomParticipant.id, user.user.name as string, UserType.User)
          setAcceptSubscription(
            supabase
              .channel(`${roomParticipant.id}:room:${room.id}`)
              .on('broadcast', { event: 'accepted' }, () => {
                setAccess(RoomAccessStatus.JOINED)
                onJoin()
              })
              .subscribe()
          )
        })
      } else {
        sendJoinRequest(guestUUID, name, UserType.Guest)
        setAcceptSubscription(
          supabase
            .channel(`${guestUUID}:room:${room.id}`)
            .on('broadcast', { event: 'accepted' }, () => {
              setAccess(RoomAccessStatus.JOINED)
              onJoin()
            })
            .subscribe()
        )
      }
    })
  }, [guestUUID, name, onJoin, room.id, room.passcode, sendJoinRequest, setAtm0sConfig, setRoomParticipant, user])

  const renderJoinButton = () => {
    switch (access) {
      case RoomAccessStatus.PENDING:
        return (
          <ButtonIcon loading={true} block type="primary" size="large" disabled={true}>
            Waiting for host to accept
          </ButtonIcon>
        )
      case RoomAccessStatus.JOINED:
        return (
          <ButtonIcon onClick={onJoin} loading={isPendingCreateRoomParticipant} block type="primary" size="large">
            Join
          </ButtonIcon>
        )
      case RoomAccessStatus.NEED_ASK:
        return (
          <ButtonIcon
            loading={isPendingCreateRoomParticipant}
            onClick={onAsk}
            block
            type="primary"
            size="large"
            disabled={!user && !name}
          >
            Ask to join
          </ButtonIcon>
        )
      default:
        return <ButtonIcon loading={true} block type="primary" size="large" disabled={true} />
    }
  }

  return (
    <MainLayout>
      <div className="lg:w-[1024px] lg:mt-24 m-auto p-4">
        <Row align="middle" gutter={[24, 24]}>
          <Col span={24} lg={12}>
            <div className="aspect-video bg-black rounded-xl overflow-hidden border dark:border-slate-800">
              {!error && selectedVideoInput ? (
                <>
                  {camStream ? (
                    <VideoViewer playsInline stream={camStream} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Icon className="-mt-6" icon={<CameraIcon color="#FFF" size={64} />} />
                      <div className="text-white">Camera is off</div>
                    </div>
                  )}
                  <Space className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <ButtonIcon
                      size="large"
                      type="primary"
                      shape="circle"
                      className={classNames('shadow-none', mic ? '' : 'bg-red-500')}
                      onClick={() => setMic(!mic)}
                      icon={mic ? <MicIcon size={16} color="#FFF" /> : <MicOffIcon size={16} color="#FFF" />}
                      tooltip="Mute/Unmute"
                    />
                    <ButtonIcon
                      size="large"
                      type="primary"
                      shape="circle"
                      className={classNames('shadow-none', camera ? '' : 'bg-red-500')}
                      onClick={() => setCamera(!camera)}
                      icon={camera ? <VideoIcon size={16} color="#FFF" /> : <VideoOffIcon size={16} color="#FFF" />}
                      tooltip="Start/Stop Video"
                    />
                  </Space>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <Icon icon={<CameraIcon color="#FFF" size={64} />} />
                  <div className="text-white text-center">Do you want people to see and hear you in the meeting?</div>
                  <div className="text-gray-500 text-xs text-center">
                    Allow access to your camera and microphone to start the meeting
                  </div>
                </div>
              )}
            </div>
          </Col>
          <Col span={24} lg={12}>
            <Spin spinning={status === 'loading'}>
              <div className="w-full">
                {user ? (
                  <div className="mb-2">
                    <Typography.Title className="font-semibold text-3xl mb-2 dark:text-gray-100">
                      Ready to join?
                    </Typography.Title>
                    <Typography.Paragraph className="text-xl mb-0 font-light dark:text-gray-400">
                      {user?.user?.name}
                    </Typography.Paragraph>
                    <Typography.Paragraph className="text-xl mb-0 font-light dark:text-gray-400">
                      {user?.user?.email}
                    </Typography.Paragraph>
                  </div>
                ) : (
                  <div className="mb-4">
                    <Typography.Title className="font-semibold text-3xl mb-2 dark:text-gray-100">
                      Enter your name to start!
                    </Typography.Title>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      size="large"
                    />
                  </div>
                )}
                {!error && (
                  <>
                    <Divider />
                    <div className="mb-4">
                      <Select
                        size="large"
                        suffixIcon={<Icon icon={<CameraIcon color="#0060FF" />} />}
                        options={map(videoInput, (d) => ({
                          label: d.label,
                          value: d.deviceId,
                        }))}
                        value={selectedVideoInput?.deviceId}
                        onChange={(value) => setSelectedVideoInput(find(videoInput, (d) => d.deviceId === value))}
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
                        onChange={(value) => setSelectedAudioInput(find(audioInput, (d) => d.deviceId === value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center mt-4">
                  <ButtonIcon onClick={() => router.push('/')} className="mr-2" type="default" size="large">
                    Cancel
                  </ButtonIcon>
                  {renderJoinButton()}
                </div>
              </div>
            </Spin>
          </Col>
        </Row>
      </div>
    </MainLayout>
  )
}
