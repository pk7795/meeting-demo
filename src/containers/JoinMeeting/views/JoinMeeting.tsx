'use client'

import { Col, Input, Modal, Row, Table, Typography } from 'antd'
import { map } from 'lodash'
import { HashIcon, LogInIcon, TextIcon, VideoIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { SCREEN } from '@public'
import { OneRoomInvite } from '@/app/(join-meeting)/page'
import { createRoom } from '@/app/actions'
import { ButtonIcon, CardPrimary, Header, useApp } from '@/components'

type Props = {
  roomInvite: OneRoomInvite[]
}

export const JoinMeeting: React.FC<Props> = ({ roomInvite }) => {
  const { message } = useApp()
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [openCreateRoomModal, setOpenCreateRoomModal] = useState(false)
  const [openJoinRoomModal, setOpenJoinRoomModal] = useState(false)
  const { data: user } = useSession()
  const [isPendingCreateRoom, startTransitionCreateRoom] = useTransition()

  const onCreateRoom = useCallback(() => {
    if (!roomName) return message.error('Please enter room name')
    startTransitionCreateRoom(() => {
      createRoom({
        data: {
          name: roomName,
        },
      }).then((room) => {
        router.push(`/meeting/${room.passcode}`)
      })
    })
  }, [message, roomName, router])

  const onJoinRoom = useCallback(() => {
    if (!passcode) return message.error('Please enter passcode')
    router.push(`/prepare-meeting/${passcode}`)
  }, [message, passcode, router])

  return (
    <div className="min-h-screen p-6">
      <div className="container m-auto">
        <Header />
      </div>
      <div className="container mt-24 m-auto h-[calc(100vh-40px)]">
        <Row align="middle" gutter={[24, 24]}>
          <Col span={24} lg={12}>
            <Typography.Title className="font-semibold text-4xl">
              Premium video meetings. Now free for everyone.
            </Typography.Title>
            <Typography.Paragraph className="font-extralight text-3xl">
              We re-engineered the service we built for secure business meetings, Bluesea Meet, to make it free and
              available for all.
            </Typography.Paragraph>
            <div className="flex items-center w-full">
              <ButtonIcon
                type="primary"
                size="large"
                onClick={() => {
                  if (user) {
                    setOpenCreateRoomModal(true)
                  } else {
                    signIn('google', { callbackUrl: '/' })
                  }
                }}
                className="mr-2 px-6 h-12"
                loading={isPendingCreateRoom}
                icon={<VideoIcon size={16} />}
              >
                {!user ? 'Sign in to start meeting' : 'Start meeting'}
              </ButtonIcon>
              <ButtonIcon
                type="primary"
                ghost
                size="large"
                onClick={() => setOpenJoinRoomModal(true)}
                className="px-6 h-12"
                icon={<LogInIcon size={16} />}
              >
                Join meeting
              </ButtonIcon>
            </div>
          </Col>
          <Col span={24} lg={12}>
            <img src={SCREEN} alt="" className="w-full" />
          </Col>
        </Row>
        <Row className="mt-6">
          <Col span={24}>
            <Typography.Title level={2} className="font-semibold text-3xl">
              {roomInvite.length > 0 ? 'Your meetings' : 'No meetings'}
            </Typography.Title>
            <CardPrimary>
              <Table
                dataSource={map(roomInvite, (r) => ({
                  ...r,
                  key: r.id,
                }))}
                columns={[
                  {
                    title: 'Room name',
                    dataIndex: 'room',
                    key: 'room',
                    render: (room) => room?.name,
                  },
                  {
                    title: 'Passcode',
                    dataIndex: 'room',
                    key: 'room',
                    render: (room) => room?.passcode,
                  },
                  {
                    title: 'Action',
                    dataIndex: 'action',
                    render: (_, record) => (
                      <div className="flex justify-end">
                        <ButtonIcon
                          type="primary"
                          size="small"
                          className="w-fit"
                          onClick={() => router.push(`/meeting/${record?.room?.passcode}`)}
                        >
                          Join
                        </ButtonIcon>
                      </div>
                    ),
                    width: 100,
                    fixed: 'right',
                    align: 'right',
                  },
                ]}
                pagination={false}
              />
            </CardPrimary>
          </Col>
        </Row>
      </div>
      <Modal
        open={openCreateRoomModal}
        onCancel={() => setOpenCreateRoomModal(false)}
        onOk={onCreateRoom}
        maskClosable={false}
        closable={false}
        okButtonProps={{
          loading: isPendingCreateRoom,
        }}
        destroyOnClose
        centered
      >
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          prefix={<TextIcon size={16} />}
          placeholder="Enter room name to start meeting"
          className="flex-1 mr-2"
          size="large"
        />
      </Modal>
      <Modal
        open={openJoinRoomModal}
        onCancel={() => setOpenJoinRoomModal(false)}
        onOk={onJoinRoom}
        maskClosable={false}
        closable={false}
        destroyOnClose
        centered
      >
        <Input
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          prefix={<HashIcon size={16} />}
          placeholder="Enter passcode to join meeting"
          className="flex-1 mr-2"
          size="large"
        />
      </Modal>
    </div>
  )
}
