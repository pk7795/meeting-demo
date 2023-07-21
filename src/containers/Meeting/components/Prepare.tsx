'use client'

import { Col, Divider, Input, Row, Select, Space, Typography } from 'antd'
import classNames from 'classnames'
import { filter, find, map } from 'lodash'
import { CameraIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, Volume2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import Webcam from 'react-webcam'
import { createRoomParticipant } from '@/app/actions'
import { ButtonIcon, Icon } from '@/components'
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
  const [videoInput, setVideoInput] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoInput, setSelectedVideoInput] = useState<MediaDeviceInfo>()

  const [audioInput, setAudioInput] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState<MediaDeviceInfo>()

  const [audioOutput, setAudioOutput] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<MediaDeviceInfo>()

  const [error, setError] = useState(false)

  const [mic, setMic] = useState(false)
  const [camera, setCamera] = useState(false)

  const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
    const videoInput = filter(mediaDevices, ({ kind }) => kind === 'videoinput')
    setVideoInput(videoInput)
    setSelectedVideoInput(videoInput[0])

    const audioInput = filter(mediaDevices, ({ kind }) => kind === 'audioinput')
    setAudioInput(audioInput)
    setSelectedAudioInput(audioInput[0])

    const audioOutput = filter(mediaDevices, ({ kind }) => kind === 'audiooutput')
    setAudioOutput(audioOutput)
    setSelectedAudioOutput(audioOutput[0])
  }, [])

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
            <div className="h-[400px] bg-black rounded-xl overflow-hidden">
              {!error && selectedVideoInput ? (
                <>
                  {camera ? (
                    <Webcam
                      audio={mic}
                      audioConstraints={{ deviceId: selectedAudioInput?.deviceId }}
                      videoConstraints={{ deviceId: selectedVideoInput?.deviceId }}
                      className="w-full h-full"
                      mirrored
                    />
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
                  <Typography.Title className="font-semibold text-3xl mb-2">Ready to join?</Typography.Title>
                  <Typography.Paragraph className="text-xl mb-0 font-light">{user?.user?.name}</Typography.Paragraph>
                  <Typography.Paragraph className="text-xl mb-0 font-light">{user?.user?.email}</Typography.Paragraph>
                </div>
              ) : (
                <div className="mb-4">
                  <Typography.Title className="font-semibold text-3xl mb-2">What&apos;s your name?</Typography.Title>
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
                  <div className="mb-4">
                    <Select
                      size="large"
                      suffixIcon={<Icon icon={<Volume2Icon color="#0060FF" />} />}
                      options={map(audioOutput, (d) => ({
                        label: d.label,
                        value: d.deviceId,
                      }))}
                      value={selectedAudioOutput?.deviceId}
                      onChange={(value) => setSelectedAudioOutput(find(audioOutput, (d) => d.deviceId === value))}
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
