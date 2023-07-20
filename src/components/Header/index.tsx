'use client'

import { ButtonIcon } from '../Custom'
import { Col, Divider, Popover, Row, Space, Typography } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { LogInIcon, LogOutIcon } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LOGO_BLACK_LONG } from '@public'
import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-react'

type Props = {}

export const Header: React.FC<Props> = () => {
  const pathname = usePathname()
  const callbackUrl = useMemo(() => pathname || '/', [pathname])
  const { data: user } = useSession()

  const [date, setDate] = useState(dayjs().format('hh:mm A • ddd, MMM DD'))

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs().format('hh:mm A • ddd, MMM DD'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-16 flex items-center w-full bg-white">
      <Row align="middle" justify="space-between" className="w-full">
        <Col>
          <img src={LOGO_BLACK_LONG} alt="" className="h-8" />
        </Col>
        <Col>
          {user ? (
            <Space>
              <Typography.Paragraph className="mb-0 text-lg">{date}</Typography.Paragraph>
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
                        'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text'
                      )}
                      onClick={() => {
                        signOut({
                          callbackUrl,
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
                        'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 text-primary_text'
                      )}
                      onClick={() => signIn('google', { callbackUrl })}
                    >
                      <IconBrandGoogle size={16} />
                      <div className="text-sm ml-2">Continue with Google</div>
                    </div>
                    <div
                      className={classNames(
                        'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer text-primary_text'
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
        </Col>
      </Row>
    </div>
  )
}
