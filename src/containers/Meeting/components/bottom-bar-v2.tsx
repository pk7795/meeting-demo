
import { CameraToggleV2 } from '@/components/media/camera'
import { MicrophoneToggleV2 } from '@/components/media/microphone'
import { ScreenToggleV2 } from '@/components/media/screen'
import BlurFade from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import { SidebarTriggerWithType, useSidebar } from '@/components/ui/sidebar'
import { useFullScreen } from '@/hooks/use-full-screen'

import { HandIcon, MaximizeIcon, MinimizeIcon, PhoneMissedIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { useMeetingParticipantState } from '../contexts'
import { cn } from '@/lib/utils'

type Props = {
  sendEvent: (event: string, data?: any) => void
}

export const BottomBarV2: React.FC<Props> = ({ sendEvent }) => {
  const router = useRouter()
  const [userState, setUserState] = useMeetingParticipantState()
  const toggleRaiseHand = () => {
    if (userState.handRaised) {
      setUserState({ ...userState, handRaised: false })
      sendEvent('interact', { handRaised: false })
    } else {
      setUserState({ ...userState, handRaised: true })
      sendEvent('interact', { handRaised: true })
    }
  }
  return (
    <BlurFade
      key={'zoom-footer'}
      duration={0.2}
      yOffset={4}
      className={'absolute -bottom-1 z-10 h-fit w-full rounded-b-2xl bg-gradient-to-t from-foreground/50 to-transparent p-4'}
    >
      <div className={'relative py-2 flex justify-between'}>
        <div>hehehe</div>
        <div className={'mx-auto flex h-11 w-max items-start gap-2'}>
          <MicrophoneToggleV2 sourceName={'audio_main'} />
          <CameraToggleV2 sourceName={'video_main'} />
          <Button
            variant={userState.handRaised ? 'yellow' : 'secondary'}
            size="full"
            className={'[&_svg]:!size-full'}
            onClick={toggleRaiseHand}

          >
            <HandIcon
              size={16}
              className={cn(
                'dark:text-white text-primary_text',
                userState.handRaised ? 'text-white' : ''
              )} />
          </Button>
          <ScreenToggleV2 sourceName={'video_screen'} />
          <Button
            variant="destructive"
            size="full"
            className={'rounded-lg [&_svg]:!size-full'}
            onClick={() => {
              const audio = new Audio('/sound-out.mp3')
              audio.play()
              router.push('/')
            }}
          >
            <PhoneMissedIcon size={16} />
          </Button>
        </div>
        <div className='flex pr-2'>
          <SidebarTriggerWithType className={'text-background '} sidebarType={'chat'} />
          <SidebarTriggerWithType className={'text-background'} sidebarType={'participant'} />
        </div>
      </div>
    </BlurFade >
  )
}
