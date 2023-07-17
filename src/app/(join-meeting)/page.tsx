'use client'

import { Col, Input, Row, Space, Typography } from 'antd'
import { HashIcon, LogInIcon, VideoIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SCREEN } from '@public'
import { ButtonIcon, Header } from '@/components'

export default function IndexJoinMeeting() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams?.get('callbackUrl') || '/new-meeting'
    const [code, setCode] = useState('')
    const { data: user } = useSession()

    const onStartMeeting = useCallback(() => {
        if (user) {
            router.push('/new-meeting')
            return
        }
        signIn('google', { callbackUrl })
    }, [callbackUrl, router, user])

    const onJoin = useCallback(() => {
        router.push(`/prepare-meeting/${code}`)
    }, [code, router])

    return (
        <div className="min-h-screen p-6">
            <Header />
            <div className="container mt-24 m-auto h-[calc(100vh-40px)]">
                <Row align="middle" gutter={[24, 24]}>
                    <Col span={24} lg={12}>
                        <Typography.Title className="font-semibold text-4xl">
                            Premium video meetings. Now free for everyone.
                        </Typography.Title>
                        <Typography.Paragraph className="font-extralight text-3xl">
                            We re-engineered the service we built for secure business meetings, Bluesea Meet, to make it
                            free and available for all.
                        </Typography.Paragraph>
                        <Space>
                            <ButtonIcon
                                onClick={onStartMeeting}
                                type="primary"
                                size="large"
                                icon={<VideoIcon size={16} />}
                            >
                                Start meeting
                            </ButtonIcon>
                            <div>Or</div>
                            <Space>
                                <Input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    prefix={<HashIcon size={16} />}
                                    placeholder="Enter code to join meeting"
                                    className="flex-1 mr-2"
                                    size="large"
                                />
                                <ButtonIcon
                                    disabled={!code}
                                    type="primary"
                                    ghost
                                    size="large"
                                    icon={<LogInIcon size={16} />}
                                    onClick={onJoin}
                                >
                                    Join meeting
                                </ButtonIcon>
                            </Space>
                        </Space>
                    </Col>
                    <Col span={24} lg={12}>
                        <img src={SCREEN} alt="" className="w-full" />
                    </Col>
                </Row>
            </div>
        </div>
    )
}
