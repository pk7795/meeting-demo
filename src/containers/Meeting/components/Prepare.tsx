'use client'

import { Col, Divider, Input, Row, Select, Space, Typography } from 'antd'
import { useSharedUserMedia, VideoViewer } from 'bluesea-media-react-sdk'
import classNames from 'classnames'
import { filter, find, map } from 'lodash'
import { CameraIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { createRoomParticipant } from '@/app/actions'
import { ButtonIcon, Icon } from '@/components'
import { useAudioInput, useSelectedCam, useSelectedMic, useVideoInput } from '@/contexts'
import { MainLayout } from '@/layouts'

type Props = {
  setIsJoined: (isJoined: boolean) => void
  name: string
  setName: (name: string) => void
}

export const Prepare: React.FC<Props> = ({ setIsJoined, name, setName }) => {
  const { data: user } = useSession()
  const router = useRouter()
  const params = useParams()
  const [isPendingCreateRoomParticipant, startTransitionCreateRoomParticipant] = useTransition()

  const [videoInput, setVideoInput] = useVideoInput()
  const [selectedVideoInput, setSelectedVideoInput] = useSelectedCam()

  const [audioInput, setAudioInput] = useAudioInput()
  const [selectedAudioInput, setSelectedAudioInput] = useSelectedMic()

  const [error, setError] = useState(false)

  const [mic, setMic] = useState(false)
  const [camera, setCamera] = useState(false)

  const [, , micStreamChanger] = useSharedUserMedia('mic_device')
  const [camStream, , camStreamChanger] = useSharedUserMedia('camera_device')

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
          deviceId: selectedVideoInput?.deviceId,
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

  const onJoinMeeting = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      createRoomParticipant({
        data: {
          name,
          passcode: params?.passcode as string,
        },
      }).then(() => {
        setIsJoined(true)
      })
    })
  }, [name, params?.passcode, setIsJoined])

  return (
    <MainLayout>
      <div className="lg:w-[1024px] lg:mt-24 m-auto p-4">
        <Row align="middle" gutter={[24, 24]}>
          <Col span={24} lg={12}>
            <div className="h-[400px] bg-black rounded-xl overflow-hidden border dark:border-slate-800">
              {!error && selectedVideoInput ? (
                <>
                  {camStream ? (
                    <VideoViewer stream={camStream} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Icon icon={<CameraIcon color="#FFF" size={64} />} />
                      <div className="text-white">Camera is off</div>
                    </div>
                  )}
                  <Space size="large" className="absolute bottom-4 left-1/2 -translate-x-1/2">
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
            <div className="w-full mt-4">
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
                    What&apos;s your name?
                  </Typography.Title>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" size="large" />
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
                <ButtonIcon
                  loading={isPendingCreateRoomParticipant}
                  onClick={onJoinMeeting}
                  block
                  type="primary"
                  size="large"
                  disabled={!user && !name}
                >
                  {user ? 'Join now' : 'Ask to join'}
                </ButtonIcon>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </MainLayout>
  )
}
