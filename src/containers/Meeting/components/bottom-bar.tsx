'use client'

import { Logo } from '@/components'
import { Button } from '@/components/ui/button'
import { CopyIcon, MaximizeIcon, MinimizeIcon, PhoneMissedIcon, XIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { useFullScreen } from '@/hooks/use-full-screen'
import { Actions } from './actions'
import { ScreenToggle } from '@/components/media/screen'

type Props = {
  meetingLink: string
}

export const BottomBar: React.FC<Props> = ({ meetingLink }) => {
  const params = useParams()
  const router = useRouter()
  const [, onCopy] = useCopyToClipboard()
  const { isMaximize, onOnOffFullScreen } = useFullScreen()
  const [isCreateNewRoom, setIsCreateNewRoom] = useState(true)

  const onCopyInviteLink = () => {
    onCopy(meetingLink as string).then(() => {
      toast.success('Copied invite link', { duration: 2000 })
    })
  }

  return (
    <div className="relative flex w-full items-center justify-between border-t py-3 pl-4 pr-[calc(16px*2+40px)]">
      <div className="flex items-center gap-2">
        <Logo />
        <div className="hidden text-base lg:block">| Room ID: {params?.passcode}</div>
        <Button variant="secondary" size="icon" onClick={onCopyInviteLink}>
          <CopyIcon size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Actions />
        <ScreenToggle sourceName="video_screen" />
        <Button variant="secondary" size="icon" onClick={onOnOffFullScreen}>
          {!isMaximize ? <MaximizeIcon size={16} /> : <MinimizeIcon size={16} />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => {
            const audio = new Audio('/sound-out.mp3')
            audio.play()
            router.push('/')
          }}
        >
          <PhoneMissedIcon size={16} />
        </Button>
      </div>
      {isCreateNewRoom && (
        <div className="absolute bottom-[calc(100%+16px)] left-4 w-[360px] rounded-xl bg-muted">
          <div className="flex items-center justify-between py-2 pl-4 pr-3">
            <div>Your meeting&apos;s ready</div>
            <Button variant="ghost" size="icon" onClick={() => setIsCreateNewRoom(false)}>
              <XIcon size={16} />
            </Button>
          </div>
          <div className="grid gap-4 px-4 pb-4">
            <div className="text-xs text-muted-foreground">Share this meeting link with others you want in the meeting</div>
            <div className="flex h-10 items-center gap-2 rounded bg-zinc-200 pl-3">
              <div className="flex-1 text-sm">{meetingLink}</div>
              <Button variant="link" size="icon" onClick={onCopyInviteLink}>
                <CopyIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
