import BlurFade from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import { InviteButton } from '@/layouts/MainLayout/invite-button'
import { useParams } from 'next/navigation'
import { themeState } from '@/recoil'
import { useRecoilState } from 'recoil'
import { MaximizeIcon, MinimizeIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useCallback } from 'react'
import { useFullScreen } from '@/hooks/use-full-screen'
type Props = {
  meetingLink?: string
}

export const Header: React.FC<Props> = ({ meetingLink }) => {
  const params = useParams()
  const [theme, setTheme] = useRecoilState(themeState)
  const { isMaximize, onOnOffFullScreen } = useFullScreen()

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
        <div className={'flex items-center'}>
          <InviteButton meetingLink={meetingLink} />
          <div className="flex items-center gap-2">
            <div className="hidden text-background lg:block"> | Room ID: {params?.passcode}</div>
          </div>
          <Button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            variant={'secondary'}
            className='rounded-full bg-transparent'
          >
            {theme === 'light' ? <SunIcon size={16} color='#ffffff' /> : <MoonIcon size={16} color="#000" />}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullScreen}
          className={'h-7 w-7 text-background'}
        >
          {!isMaximize ? <MaximizeIcon size={16} /> : <MinimizeIcon size={16} />}
        </Button>
      </header>
    </BlurFade>
  )
}
