import BlurFade from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import { InviteButton } from '@/layouts/MainLayout/invite-button'
import { useParams } from 'next/navigation'
import { themeState } from '@/recoil'
import { useRecoilState } from 'recoil'
import { MaximizeIcon, MinimizeIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useFullScreen } from '@/hooks/use-full-screen'
import dayjs from 'dayjs'
type Props = {
  meetingLink?: string
}

export const Header: React.FC<Props> = ({ meetingLink }) => {
  const params = useParams()
  const [theme, setTheme] = useRecoilState(themeState)
  const { isMaximize, onOnOffFullScreen } = useFullScreen()
  const [date, setDate] = useState(dayjs().format('hh:mm A'))

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(dayjs().format('hh:mm A'))
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const onToggleFullScreen = useCallback(() => {
    onOnOffFullScreen()
  }, [isMaximize, onOnOffFullScreen])
  return (
    <BlurFade
      key={'zoom-header'}
      duration={0.2}
      yOffset={-4}
      className={
        'absolute -top-1 z-10 h-fit w-full rounded-b-2xl bg-opacity-100 bg-gradient-to-b from-foreground/50 to-transparent p-4'
      }
    >
      <header className="flex justify-between">
        <div className={'flex items-center gap-2'}>
          <div className="flex items-center gap-2">
            <div className="hidden text-background lg:block">{date} | Room ID: {params?.passcode}</div>
          </div>
          <InviteButton meetingLink={meetingLink} />
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant={'ghost'}
            className='h-7 w-7 text-background'
          >
            {theme === 'light' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullScreen}
            className={'h-7 w-7 text-background'}
          >
            {!isMaximize ? <MaximizeIcon size={16} /> : <MinimizeIcon size={16} />}
          </Button>
        </div>
      </header>
    </BlurFade>
  )
}
