'use client'

import { Badge, Divider, Popover, Space } from 'antd'
import classNames from 'classnames'
import { map } from 'lodash'
import {
    BellIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    LayoutDashboardIcon,
    ListVideoIcon,
    LogOutIcon,
    SearchIcon,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { LOGO_BLACK_LONG, LOGO_SHORT } from '@public'
import { ButtonIcon } from '@/components'
import { useDevice } from '@/hooks'
import { collapsedSidebarState, openCmdkState } from '@/recoil'

export const ROUTES = [
    {
        title: 'Dashboard',
        href: '/',
        icon: <LayoutDashboardIcon size={16} />,
    },
    {
        title: 'Channels',
        href: '/channels',
        icon: <ListVideoIcon size={16} />,
    },
]

const Menu = ({ icon, href, title, collapsedSidebar }: any) => {
    const pathname = usePathname()
    return (
        <Link href={href}>
            <div
                className={classNames(
                    'hover:bg-gray_2 h-8 rounded-lg flex items-center cursor-pointer mb-1 text-primary_text',
                    pathname === href && 'bg-gray_2',
                    !collapsedSidebar ? 'px-2' : 'justify-center'
                )}
            >
                {icon}
                {!collapsedSidebar && <div className="text-sm ml-2">{title}</div>}
            </div>
        </Link>
    )
}

type Props = {}

export const Sidebar: React.FC<Props> = () => {
    const setOpenCmdk = useSetRecoilState(openCmdkState)
    const { data: session } = useSession()
    const [collapsedSidebar, setCollapsedSidebar] = useRecoilState(collapsedSidebarState)
    const { isMobile } = useDevice()

    useEffect(() => {
        if (isMobile) {
            setCollapsedSidebar(false)
        }
    }, [isMobile, setCollapsedSidebar])

    return (
        <div
            className={classNames(
                'h-full bg-gray_1 border-r px-4',
                !collapsedSidebar ? 'w-[292px]' : 'w-16',
                isMobile ? 'fixed z-50' : 'relative'
            )}
        >
            <div
                className={classNames(
                    'flex items-center justify-between pb-2 pt-4',
                    !collapsedSidebar ? '' : 'flex-col'
                )}
            >
                <Link href="/">
                    <img
                        src={!collapsedSidebar ? LOGO_BLACK_LONG : LOGO_SHORT}
                        alt=""
                        className={classNames('h-6', !collapsedSidebar ? 'ml-2' : 'mb-2')}
                    />
                </Link>
                <Space>
                    <Popover
                        placement="bottomRight"
                        content={
                            <div>
                                <div>
                                    <Space>
                                        <div className="h-12 w-12 rounded-lg flex items-center justify-center text-white bg-amber-500 text-2xl uppercase">
                                            {session?.user?.name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="">{session?.user?.name}</div>
                                            <div className="text-neutral-500">{session?.user?.email}</div>
                                        </div>
                                    </Space>
                                </div>
                                <Divider className="my-2" />
                                <div
                                    className={classNames(
                                        'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 text-primary_text'
                                    )}
                                >
                                    <BellIcon size={16} />
                                    <div className="text-sm ml-2">Notification</div>
                                </div>
                                <div
                                    className={classNames(
                                        'hover:bg-gray_2 h-8 px-2 rounded-lg flex items-center cursor-pointer mb-1 text-primary_text'
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
                        trigger="click"
                    >
                        <Badge dot>
                            <div className="h-7 w-7 rounded-md flex items-center justify-center text-white bg-amber-500 text-xs uppercase cursor-pointer">
                                {session?.user?.name?.charAt(0)}
                            </div>
                        </Badge>
                    </Popover>
                </Space>
            </div>
            <div
                onClick={() => setOpenCmdk(true)}
                className="rounded-lg mt-2 border border-1 h-8 px-2 mb-2 w-full flex items-center justify-between bg-white hover:border-[#d2d2da] cursor-pointer"
            >
                <div className="flex items-center">
                    <SearchIcon size={16} />
                    {!collapsedSidebar && <div className="text-sm text-[#6e6e77] ml-2">Search</div>}
                </div>
                {!collapsedSidebar && <div className="text-[10px] text-[#6e6e77]">Cmd+K</div>}
            </div>
            <div>
                {map(ROUTES, (i, index) => (
                    <Menu key={index} icon={i.icon} href={i.href} title={i.title} collapsedSidebar={collapsedSidebar} />
                ))}
            </div>
            {!isMobile && (
                <ButtonIcon
                    onClick={() => setCollapsedSidebar(!collapsedSidebar)}
                    type="default"
                    shape="circle"
                    className="rounded-full absolute -right-3 top-12"
                    icon={!collapsedSidebar ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
                />
            )}
        </div>
    )
}
