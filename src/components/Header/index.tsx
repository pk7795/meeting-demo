'use client'

import { ButtonIcon } from '../Custom'
import { Button, Col, Divider, Form, Input, Modal, Popover, Row, Space, Typography } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { LogInIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { LOGO_BLACK_LONG, LOGO_WHITE_LONG } from '@public'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
import { themeState } from '@/recoil'

type Props = {}

export const Header: React.FC<Props> = () => {
  const pathname = usePathname()
  const callbackUrl = useMemo(() => pathname || '/', [pathname])
  const { data: user } = useSession()
  const [theme, setTheme] = useRecoilState(themeState)

  const [date, setDate] = useState(dayjs().format('hh:mm A • ddd, MMM DD'))
  const [form] = Form.useForm()

  const onFinish = useCallback(() => {
    //
  }, [])

  useEffect(() => {
    if (window.location.href.includes('localhost')) {
      form.setFieldsValue({
        email: 'admin@bluesea.live',
        password: 'bluesea@123456',
      })
    }
  }, [form])

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs().format('hh:mm A • ddd, MMM DD'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.remove('light')
      document.body.classList.remove('bg-white')
      document.body.classList.add('dark')
      document.body.classList.add('bg-dark_ebony')
    } else {
      document.body.classList.remove('dark')
      document.body.classList.remove('bg-dark_ebony')
      document.body.classList.add('light')
      document.body.classList.add('bg-white')
    }
  }, [theme])

  return (
    <div className="h-16 flex items-center w-full">
      <Row align="middle" justify="space-between" className="w-full">
        <Col>
          <Link href="/">
            <img src={theme === 'dark' ? LOGO_WHITE_LONG : LOGO_BLACK_LONG} alt="" className="h-8" />
          </Link>
        </Col>
        <Col>
          <Space>
            {user ? (
              <Space>
                <Typography.Paragraph className="mb-0 hidden md:block lg:text-lg dark:text-white">
                  {date}
                </Typography.Paragraph>
                <Popover
                  placement="bottomRight"
                  overlayInnerStyle={{
                    padding: 8,
                  }}
                  content={
                    <div>
                      <div>
                        <Space>
                          <div className="h-12 w-12 rounded-full flex items-center justify-center text-white bg-amber-500 text-2xl uppercase">
                            {user?.user?.name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <div className="">{user?.user?.name}</div>
                            <div className="text-neutral-500">{user?.user?.email}</div>
                          </div>
                        </Space>
                      </div>
                      <Divider className="my-2" />
                      <div
                        className={classNames(
                          'hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text dark:text-gray-100'
                        )}
                        onClick={() => {
                          signOut({
                            callbackUrl: '/',
                          })
                        }}
                      >
                        <LogOutIcon size={16} />
                        <div className="text-sm ml-2">Log out</div>
                      </div>
                    </div>
                  }
                  trigger="hover"
                >
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-white bg-amber-500 text-xs uppercase cursor-pointer">
                    {user?.user?.name?.charAt(0)}
                  </div>
                </Popover>
              </Space>
            ) : (
              <Space>
                <Popover
                  placement="bottomRight"
                  overlayInnerStyle={{
                    padding: 8,
                  }}
                  content={
                    <div>
                      <div
                        className={classNames(
                          'hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text dark:text-gray-100 mb-1'
                        )}
                        onClick={() => signIn('google', { callbackUrl })}
                      >
                        <IconBrandGoogle size={16} />
                        <div className="text-sm ml-2">Continue with Google</div>
                      </div>
                      <div
                        className={classNames(
                          'hover:bg-gray-100 dark:hover:bg-gray-800 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text dark:text-gray-100'
                        )}
                        onClick={() => signIn('github', { callbackUrl })}
                      >
                        <IconBrandGithub size={16} />
                        <div className="text-sm ml-2">Continue with Github</div>
                      </div>
                    </div>
                  }
                  trigger="hover"
                >
                  <ButtonIcon size="large" type="primary" ghost icon={<LogInIcon size={16} />}>
                    Sign in
                  </ButtonIcon>
                </Popover>
              </Space>
            )}
            <ButtonIcon
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              shape="circle"
              icon={theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} color="#000" />}
            />
          </Space>
        </Col>
      </Row>
      <Modal footer={false}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Typography.Title level={4} className="dark:text-gray-100">
            Sign In
          </Typography.Title>
          <Typography.Paragraph className="dark:text-gray-400">Please enter your details below.</Typography.Paragraph>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
              },
            ]}
          >
            <Input size="large" placeholder="example@email.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
          >
            <Input.Password size="large" placeholder="Enter your password" />
          </Form.Item>
          <Form.Item>
            <Button size="large" block type="primary" className="bg-primary" htmlType="submit">
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
