'use client'

import { Button } from '@repo/ui/components/index'
import {
  ChevronUpIcon,
  CopyIcon,
  MicOffIcon,
  PhoneMissedIcon,
  ScreenShareIcon,
  Settings2Icon,
  UsersIcon,
  VideoIcon,
} from '@repo/ui/icons/index'
import { Logo } from '@/components'

export const BottomBar = () => {
  return (
    <div className="w-full flex items-center justify-between py-3 border-t pl-4 pr-[calc(16px*2+40px)]">
      <div className="flex items-center gap-2">
        <Logo />
        <div className="text-xl hidden lg:block">| Room ID: 1234-5678</div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="destructive" size="icon">
          <MicOffIcon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <VideoIcon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <ScreenShareIcon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <UsersIcon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <Settings2Icon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <CopyIcon size={16} />
        </Button>
        <Button variant="secondary" size="icon">
          <ChevronUpIcon size={16} />
        </Button>
        <Button variant="destructive" size="icon">
          <PhoneMissedIcon size={16} />
        </Button>
      </div>
    </div>
  )
}
