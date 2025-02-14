
import { CameraToggleV2 } from '@/components/media/camera'
import { MicrophoneToggleV2 } from '@/components/media/microphone'
import { ScreenToggleV2 } from '@/components/media/screen'
import BlurFade from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
import { SidebarTriggerWithType } from '@/components/ui/sidebar'

import { HandIcon, LogOutIcon, MoreHorizontalIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { cn } from '@/lib/utils'
import { useDevice } from '@/hooks'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useMediaContext, useMeetingParticipantState } from '@/contexts'

type Props = {
  sendEvent: (event: string, data?: any) => void
}

export const BottomBarV2: React.FC<Props> = ({ sendEvent }) => {
  const router = useRouter()
  const [userState, setUserState] = useMeetingParticipantState()
  const { isMobile } = useDevice();

  const mediaContext = useMediaContext()

  const toggleRaiseHand = () => {
    if (userState.handRaised) {
      setUserState({ ...userState, handRaised: false })
      sendEvent('interact', { handRaised: false })
    } else {
      setUserState({ ...userState, handRaised: true })
      sendEvent('interact', { handRaised: true })
    }
  }
  const toggleLeaveMeeting = () => {
    mediaContext.turnOffAllDevices()
    router.push('/')
  }

  return (
    <BlurFade
      key={'zoom-footer'}
      duration={0.2}
      yOffset={4}
      className={'absolute -bottom-1 z-10 h-fit w-full rounded-b-2xl from-background/50 to-transparent p-4'}
    >
      <div className={'relative py-2 flex justify-between'}>
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
              className={cn(userState.handRaised ? 'text-white' : '')} />
          </Button>
          {!isMobile && <ScreenToggleV2 sourceName={'video_screen'} />}
          {isMobile && <SettingsButton />}
          <Button
            variant="destructive"
            size="full"
            className={'rounded-lg [&_svg]:!size-full'}
            onClick={toggleLeaveMeeting}
          >
            <LogOutIcon size={20} className="rotate-icon" />
          </Button>
        </div>
        {!isMobile && <div className='flex pr-2'>
          <SidebarTriggerWithType variant={"ghost"} size={"full"} className={'h-10 w-10 text-foreground'} sidebarType={'chat'} />
          <SidebarTriggerWithType variant={"ghost"} size={"full"} className={'h-10 w-10 text-foreground'} sidebarType={'participant'} />
        </div>}
      </div>
    </BlurFade >
  )
}
const SettingsButton: React.FC = () => {
  const [isOpenSetting, setIsOpenSetting] = useState(false)

  return (
    <Button
      variant={'secondary'}
      size="full"
      className={'gap-0 bg-secondary-foreground/90 p-0'}
      onClick={() => setIsOpenSetting((prev) => !prev)}
    >
      <DropdownMenu open={isOpenSetting} onOpenChange={(v) => setIsOpenSetting(v)}>
        <DropdownMenuTrigger className={'aspect-square h-full'}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={'flex aspect-square h-full items-center justify-center'}>
                <MoreHorizontalIcon size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>More</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={'border-none'}>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem>
            <SidebarTriggerWithType variant={"secondary"} size={"full"} className={'rounded-lg [&_svg]:!size-full'} sidebarType={'chat'} />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SidebarTriggerWithType variant={"secondary"} size={"full"} className={'rounded-lg [&_svg]:!size-full'} sidebarType={'participant'} />
          </DropdownMenuItem>
          <DropdownMenu />
        </DropdownMenuContent>
      </DropdownMenu>
    </Button>
  )
}