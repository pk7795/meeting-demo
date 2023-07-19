'use client'

import { ROUTES, Sidebar } from './Sidebar'
import { Drawer, Space } from 'antd'
import classNames from 'classnames'
import { find, last, map } from 'lodash'
import { MenuIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment, ReactNode, useState } from 'react'
import { ButtonIcon, Cmdk } from '@/components'
import { useDevice } from '@/hooks'

type Props = {
  children?: ReactNode
  extra?: ReactNode
  breadcrumbs?: {
    name: string
    path?: string
  }[]
}

export const MainLayout: React.FC<Props> = ({ children, extra, breadcrumbs }) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useDevice()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col overflow-auto">
      <div className="flex flex-grow min-h-0">
        {isMobile ? (
          <Drawer
            width={292}
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            placement="left"
            bodyStyle={{ padding: 0 }}
            headerStyle={{ display: 'none' }}
            closeIcon={false}
          >
            <Sidebar />
          </Drawer>
        ) : (
          <Sidebar />
        )}
        <div className="h-full flex flex-col flex-grow flex-1 w-full">
          <div className="flex items-center justify-between py-4 px-6 border-b">
            <Space>
              {isMobile && <ButtonIcon onClick={() => setOpenMenu(true)} icon={<MenuIcon size={16} />} />}
              <div className="text-base">{find(ROUTES, (i) => i.href === pathname)?.title}</div>
              {breadcrumbs && (
                <Space>
                  {map(!isMobile ? breadcrumbs : [last(breadcrumbs)], (i, index) => (
                    <Fragment key={index}>
                      <div
                        onClick={() => i?.path && router.push(i?.path)}
                        className={classNames('text-base', i?.path ? 'text-gray_9 cursor-pointer' : '')}
                      >
                        {i?.name}
                      </div>
                      {!isMobile && index !== breadcrumbs?.length - 1 && <div>/</div>}
                    </Fragment>
                  ))}
                </Space>
              )}
            </Space>
            {extra}
          </div>
          <div className="p-6 overflow-y-auto h-screen">{children}</div>
        </div>
        <Cmdk />
      </div>
    </div>
  )
}
