'use client'

import classNames from 'classnames'
import dayjs from 'dayjs'
import { LogInIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { IconBrandGoogle } from '@tabler/icons-react'
import { themeState } from '@/recoil'
import { ERMIS_LOGO } from '@public'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type Props = {}

export const Header: React.FC<Props> = () => {
  const pathname = usePathname()
  const callbackUrl = useMemo(() => pathname || '/', [pathname])
  const { data: session } = useSession()
  const [theme, setTheme] = useRecoilState(themeState)

  const [date, setDate] = useState(dayjs().format('hh:mm A • ddd, MMM DD'))
  const [popoverOpen, setPopoverOpen] = useState(false);
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
    <div>
      <header className="flex justify-between h-16 items-center w-full">
        <div className={'flex items-center gap-2'}>
          <Link href="/" style={{ justifyContent: 'center', flex: 'row' }}>
            <div className='flex'>
              <img src={theme === 'dark' ? ERMIS_LOGO : ERMIS_LOGO} alt="" className="h-8 mr-4" />
              <div className="hidden text-foreground lg:block text-xl">Ermis Meet</div>
            </div>
          </Link>
        </div>
        <div className='flex gap-2 items-center'>
          {
            session ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="hidden text-foreground lg:block">{date}</div>
                </div>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"
                      onMouseEnter={() => setPopoverOpen(true)}
                      onMouseLeave={() => setPopoverOpen(false)}
                    >
                      <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage src={session.user?.image as string} alt={session.user?.name as string} />
                        <AvatarFallback className="rounded-full">{session.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 rounded-full">
                          <AvatarImage src={session.user?.image as string} alt={session.user?.name as string} />
                          <AvatarFallback className="rounded-full">{session.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="">{session?.user?.name}</div>
                          <div className="text-neutral-500">{session?.user?.email}</div>
                        </div>
                      </div>
                      <div className="my-2"></div>

                      <Button
                        variant="outline"
                        size="full"
                        onClick={() => {
                          signOut({
                            callbackUrl: '/',
                          })
                        }}
                        className={classNames(
                          'h-8 flex mb-1 bg-backgroundV2'
                        )}
                      >
                        <div className='flex items-start gap-2 w-full pl-2'>
                          <LogOutIcon size={16} />
                          <div className="text-sm ml-2">Log out</div>
                        </div>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (<div>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="default"
                    onMouseEnter={() => setPopoverOpen(true)}
                    onMouseLeave={() => setPopoverOpen(false)}
                  >
                    <LogInIcon size={16} />
                    Sign in
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setPopoverOpen(true)}
                  onMouseLeave={() => setPopoverOpen(false)}>
                  <Button
                    variant="outline"
                    size="full"
                    onClick={() => signIn('google', { callbackUrl })}
                    className={classNames(
                      'h-8 flex mb-1 bg-backgroundV2'
                    )}
                  >
                    <IconBrandGoogle size={16} />
                    <div className="text-sm ml-2">Continue with Google</div>
                  </Button>
                </PopoverContent>
              </Popover>
            </div>)
          }
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant={'ghost'}
            className='h-7 w-7 text-foreground'
          >
            {theme === 'light' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </Button>
        </div>
      </header>
    </div>
  )
}
