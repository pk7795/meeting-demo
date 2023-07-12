'use client'

import { Input, Select, Space, Typography } from 'antd'
import classNames from 'classnames'
import { filter, find, map } from 'lodash'
import { CameraIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, Volume2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { ButtonIcon, CardPrimary, Icon } from '@/components'

export default function IndexPrepareMeeting() {
    const { data: user } = useSession()
    const [videoInput, setVideoInput] = useState<MediaDeviceInfo[]>([])
    const [selectedVideoInput, setSelectedVideoInput] = useState<MediaDeviceInfo>()

    const [audioInput, setAudioInput] = useState<MediaDeviceInfo[]>([])
    const [selectedAudioInput, setSelectedAudioInput] = useState<MediaDeviceInfo>()

    const [audioOutput, setAudioOutput] = useState<MediaDeviceInfo[]>([])
    const [selectedAudioOutput, setSelectedAudioOutput] = useState<MediaDeviceInfo>()

    const [error, setError] = useState(false)

    const [mic, setMic] = useState(false)
    const [camera, setCamera] = useState(false)

    const [name, setName] = useState('')

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

    return (
        <div className="overflow-y-auto h-screen p-6 bg-[#F0F2F5]">
            <div className="w-full lg:w-[1024px] m-auto">
                <CardPrimary>
                    <div className="h-[400px] bg-black rounded-xl overflow-hidden">
                        {!error && selectedVideoInput ? (
                            <>
                                {/**
                                 * NOTE: Turn on/off camera
                                 * By: @caohv
                                 */}
                                {camera ? (
                                    <Webcam
                                        audio={mic}
                                        audioConstraints={{ deviceId: selectedAudioInput?.deviceId }}
                                        videoConstraints={{ deviceId: selectedVideoInput?.deviceId }}
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <Icon icon={<CameraIcon color="#FFF" size={64} />} />
                                        <div className="text-white">Camera is off</div>
                                    </div>
                                )}
                                <Space className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames('shadow-none', mic ? '' : 'bg-red-500')}
                                        onClick={() => setMic(!mic)}
                                        icon={
                                            mic ? (
                                                <MicIcon size={16} color="#FFF" />
                                            ) : (
                                                <MicOffIcon size={16} color="#FFF" />
                                            )
                                        }
                                        tooltip="Mute/Unmute"
                                    />
                                    <ButtonIcon
                                        size="middle"
                                        type="primary"
                                        className={classNames('shadow-none', camera ? '' : 'bg-red-500')}
                                        onClick={() => setCamera(!camera)}
                                        icon={
                                            camera ? (
                                                <VideoIcon size={16} color="#FFF" />
                                            ) : (
                                                <VideoOffIcon size={16} color="#FFF" />
                                            )
                                        }
                                        tooltip="Start/Stop Video"
                                    />
                                </Space>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <Icon icon={<CameraIcon color="#FFF" size={64} />} />
                                <div className="text-white">Do you want people to see and hear you in the meeting?</div>
                                <div className="text-gray-500 text-xs">
                                    Allow access to your camera and microphone to start the meeting
                                </div>
                            </div>
                        )}
                    </div>
                </CardPrimary>
                <CardPrimary className="mt-6">
                    <div className="w-full mt-4">
                        {user ? (
                            <div className="mb-2">
                                <Typography.Paragraph className="font-semibold mb-2">
                                    Ready to join?
                                </Typography.Paragraph>
                                {user?.user?.name}
                            </div>
                        ) : (
                            <div className="mb-4">
                                <Typography.Paragraph className="font-semibold mb-2">
                                    What&apos;s your name?
                                </Typography.Paragraph>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name"
                                />
                            </div>
                        )}
                        {!error && (
                            <>
                                <Typography.Paragraph className="font-semibold mb-2">Controls</Typography.Paragraph>
                                <div className="mb-4">
                                    <Select
                                        suffixIcon={<Icon icon={<CameraIcon color="#0060FF" />} />}
                                        options={map(videoInput, (d) => ({
                                            label: d.label,
                                            value: d.deviceId,
                                        }))}
                                        value={selectedVideoInput?.deviceId}
                                        onChange={(value) =>
                                            setSelectedVideoInput(find(videoInput, (d) => d.deviceId === value))
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <Select
                                        suffixIcon={<Icon icon={<MicIcon color="#0060FF" />} />}
                                        options={map(audioInput, (d) => ({
                                            label: d.label,
                                            value: d.deviceId,
                                        }))}
                                        value={selectedAudioInput?.deviceId}
                                        onChange={(value) =>
                                            setSelectedAudioInput(find(audioInput, (d) => d.deviceId === value))
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div className="mb-4">
                                    <Select
                                        suffixIcon={<Icon icon={<Volume2Icon color="#0060FF" />} />}
                                        options={map(audioOutput, (d) => ({
                                            label: d.label,
                                            value: d.deviceId,
                                        }))}
                                        value={selectedAudioOutput?.deviceId}
                                        onChange={(value) =>
                                            setSelectedAudioOutput(find(audioOutput, (d) => d.deviceId === value))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </>
                        )}
                        {/**
                         * NOTE: enable if name is not empty
                         * By: @caohv
                         */}
                        <ButtonIcon block className="mt-4" type="primary" size="large" disabled={!name}>
                            Ask to join
                        </ButtonIcon>
                    </div>
                </CardPrimary>
            </div>
        </div>
    )
}
