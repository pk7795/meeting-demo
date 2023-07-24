'use client'

import { Col, Divider, Popover, Row, Space, Typography } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { LogInIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { LOGO_BLACK_LONG, LOGO_WHITE_LONG } from '@public'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'
import { ButtonIcon } from '@/components'
import { themeState } from '@/recoil'

type Props = {}

export const Header: React.FC<Props> = () => {
  const pathname = usePathname()
  const callbackUrl = useMemo(() => pathname || '/', [pathname])
  const { data: user } = useSession()
  const [theme, setTheme] = useRecoilState(themeState)

  const [date, setDate] = useState(dayjs().format('hh:mm A • ddd, MMM DD'))

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
    </div>
  )
}
