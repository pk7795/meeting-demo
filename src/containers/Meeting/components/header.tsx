import BlurFade from '@/components/ui/blur-fade'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { InviteButton } from '@/layouts/MainLayout/invite-button'
import { useParams } from 'next/navigation'

type Props = {
  meetingLink?: string
}

export const Header: React.FC<Props> = ({ meetingLink }) => {
  const params = useParams()

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
        </div>
        <SidebarTrigger className={'text-background'} />
      </header>
    </BlurFade>
  )
}
