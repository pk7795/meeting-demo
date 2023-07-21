'use client'

import { Col, Form, Input, Modal, Popover, Row, Space, Table, Typography } from 'antd'
import classNames from 'classnames'
import { isEmpty, map } from 'lodash'
import { HashIcon, LogInIcon, XIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { RoomInvite } from '@prisma/client'
import { SCREEN } from '@public'
import { IconBrandGithub, IconBrandGoogle, IconLogin, IconVideoPlus } from '@tabler/icons-react'
import { OneMyRooms, OneRoomInvite } from '@/app/(join-meeting)/page'
import { createRoom } from '@/app/actions'
import { ButtonIcon, CardPrimary, Copy, Icon, useApp } from '@/components'
import { supabase } from '@/config/supabase'
import { GlobalContextProvider } from '@/contexts'
import { MainLayout } from '@/layouts'

type Props = {
  roomInvite: OneRoomInvite[] | null
  myRooms: OneMyRooms[] | null
}

export const WrappedJoinMeeting = ({ roomInvite, myRooms }: Props) => (
  <GlobalContextProvider>
    <JoinMeeting roomInvite={roomInvite} myRooms={myRooms} />
  </GlobalContextProvider>
)

export const JoinMeeting: React.FC<Props> = ({ roomInvite, myRooms }) => {
  const { message } = useApp()
  const router = useRouter()
  const [formCreateRoom] = Form.useForm()
  const [formJoinRoom] = Form.useForm()

  const [openCreateRoomModal, setOpenCreateRoomModal] = useState(false)
  const [openJoinRoomModal, setOpenJoinRoomModal] = useState(false)
  const { data: user } = useSession()
  const [isPendingCreateRoom, startTransitionCreateRoom] = useTransition()
  const [invites, setInvites] = useState<OneRoomInvite[] | null>(roomInvite)

  const onNewInvite = useCallback(
    async (invite: RoomInvite) => {
      const room = await supabase.from('Room').select('*').eq('id', invite.roomId).single()

      const roomInvite = { ...invite, room: room.data }

      if (invites) {
        setInvites([...invites, roomInvite])
      } else {
        setInvites([roomInvite])
      }
    },
    [invites, supabase]
  )

  const onCreateRoom = useCallback(
    ({ room_name }: { room_name: string }) => {
      if (!room_name) return message.error('Please enter room name')
      startTransitionCreateRoom(() => {
        createRoom({
          data: {
            name: room_name,
          },
        }).then((room) => {
          router.push(`/meeting/${room.passcode}`)
        })
      })
    },
    [message, router]
  )

  const onJoinRoom = useCallback(
    ({ passcode }: { passcode: string }) => {
      if (!passcode) return message.error('Please enter passcode')
      router.push(`/meeting/${passcode}`)
    },
    [message, router]
  )

  const onCancel = useCallback(() => {
    setOpenCreateRoomModal(false)
    setOpenJoinRoomModal(false)
    formCreateRoom.resetFields()
    formJoinRoom.resetFields()
  }, [formCreateRoom, formJoinRoom])

  useEffect(() => {
    if (user) {
      const roomInviteSubscription = supabase
        .channel('room-invite:' + user!.user!.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'RoomInvite',
            filter: 'email=eq.' + user!.user!.email,
          },
          (payload: { new: RoomInvite }) => onNewInvite(payload.new)
        )
        .subscribe()

      return () => {
        roomInviteSubscription?.unsubscribe()
      }
    }
  }, [onNewInvite, supabase, user])
  return (
    <MainLayout>
      <div className="container p-6 m-auto">
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
              {!user ? (
                <Popover
                  placement="bottomLeft"
                  overlayInnerStyle={{
                    padding: 8,
                  }}
                  content={
                    <div>
                      <div
                        className={classNames(
                          'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 text-primary_text'
                        )}
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                      >
                        <IconBrandGoogle size={16} />
                        <div className="text-sm ml-2">Continue with Google</div>
                      </div>
                      <div
                        className={classNames(
                          'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text'
                        )}
                        onClick={() => signIn('github', { callbackUrl: '/' })}
                      >
                        <IconBrandGithub size={16} />
                        <div className="text-sm ml-2">Continue with Github</div>
                      </div>
                    </div>
                  }
                  trigger="hover"
                >
                  <ButtonIcon type="primary" size="large" className="mr-2 px-6 h-12" icon={<LogInIcon size={16} />}>
                    Sign in to start meeting
                  </ButtonIcon>
                </Popover>
              ) : (
                <ButtonIcon
                  type="primary"
                  size="large"
                  onClick={() => setOpenCreateRoomModal(true)}
                  className="mr-2 px-6 h-12"
                  icon={<IconVideoPlus />}
                >
                  New meeting
                </ButtonIcon>
              )}
              <ButtonIcon
                type="primary"
                ghost
                size="large"
                onClick={() => setOpenJoinRoomModal(true)}
                className="px-6 h-12"
                icon={<IconLogin />}
              >
                Join meeting
              </ButtonIcon>
            </div>
          </Col>
          <Col span={24} lg={12}>
            <img src={SCREEN} alt="" className="w-full" />
          </Col>
        </Row>
        {!isEmpty(myRooms) && (
          <Row className="mt-6">
            <Col span={24}>
              <CardPrimary title="My rooms">
                <Table
                  dataSource={map(myRooms, (r) => ({
                    ...r,
                    key: r.id,
                  }))}
                  showHeader={false}
                  columns={[
                    {
                      title: 'Room name',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Passcode',
                      dataIndex: 'passcode',
                      key: 'passcode',
                      render: (passcode) => (
                        <Space size="small">
                          <Icon icon={<HashIcon size={16} />} />
                          <Copy text={passcode}>{passcode}</Copy>
                        </Space>
                      ),
                    },
                    {
                      title: '',
                      dataIndex: 'action',
                      render: (_, record) => (
                        <div className="flex justify-end">
                          <ButtonIcon
                            size="small"
                            className="font-bold"
                            onClick={() => router.push(`/meeting/${record?.passcode}`)}
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
        )}
        {!isEmpty(invites) && (
          <Row className="mt-6">
            <Col span={24}>
              <CardPrimary title="My invites">
                <Table
                  dataSource={map(invites, (r) => ({
                    ...r,
                    key: r.id,
                  }))}
                  showHeader={false}
                  columns={[
                    {
                      title: 'Room name',
                      dataIndex: 'room',
                      key: 'room',
                      render: (room) => room?.name,
                    },
                    {
                      title: 'Passcode',
                      dataIndex: 'passcode',
                      key: 'passcode',
                      render: (_, record) => (
                        <Space size="small">
                          <Icon icon={<HashIcon size={16} />} />
                          <Copy text={record?.room?.passcode || ''}>{record?.room?.passcode}</Copy>
                        </Space>
                      ),
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
        )}
      </div>
      <Modal
        open={openCreateRoomModal}
        onCancel={onCancel}
        maskClosable={false}
        closeIcon={<XIcon size={16} />}
        destroyOnClose
        centered
        footer={false}
        title="Create room"
      >
        <Form form={formCreateRoom} layout="vertical" onFinish={onCreateRoom}>
          <Form.Item label="Room name" name="room_name" rules={[{ required: true, message: 'Please enter room name' }]}>
            <Input placeholder="Enter room name" size="large" />
          </Form.Item>
          <div className="flex items-center justify-between">
            <ButtonIcon onClick={onCancel} type="primary" ghost size="large" className="flex-1 mr-2">
              Cancel
            </ButtonIcon>
            <ButtonIcon loading={isPendingCreateRoom} htmlType="submit" type="primary" size="large" className="flex-1">
              Create
            </ButtonIcon>
          </div>
        </Form>
      </Modal>
      <Modal
        open={openJoinRoomModal}
        onCancel={onCancel}
        maskClosable={false}
        closeIcon={<XIcon size={16} />}
        destroyOnClose
        centered
        footer={false}
        title="Join room"
      >
        <Form form={formJoinRoom} layout="vertical" onFinish={onJoinRoom}>
          <Form.Item label="Passcode" name="passcode" rules={[{ required: true, message: 'Please enter passcode' }]}>
            <Input placeholder="Enter passcode" size="large" />
          </Form.Item>
          <div className="flex items-center justify-between">
            <ButtonIcon onClick={onCancel} type="primary" ghost size="large" className="flex-1 mr-2">
              Cancel
            </ButtonIcon>
            <ButtonIcon htmlType="submit" type="primary" size="large" className="flex-1">
              Join
            </ButtonIcon>
          </div>
        </Form>
      </Modal>
    </MainLayout>
  )
}
