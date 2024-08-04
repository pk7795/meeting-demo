'use client'

import { Actions } from '.'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { ScreenToggle } from '@atm0s-media-sdk/react-ui/lib'
import { Button } from '@atm0s-media-sdk/ui/components/index'
import { CopyIcon, MaximizeIcon, MinimizeIcon, PhoneMissedIcon } from '@atm0s-media-sdk/ui/icons/index'
import { Logo } from '@/components'
import { useFullScreen } from '@/hooks'

export const BottomBar = () => {
  const params = useParams()
  const [, onCopy] = useCopyToClipboard()
  const router = useRouter()
  const { isMaximize, onOnOffFullScreen } = useFullScreen()
  return (
    <div className="w-full flex items-center justify-between py-3 border-t pl-4 pr-[calc(16px*2+40px)]">
      <div className="flex items-center gap-2">
        <Logo />
        <div className="text-xl hidden lg:block">| Room ID: {params?.room}</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            onCopy(params?.room as string).then(() => {
              toast.success('Room ID copied to clipboard', { duration: 1500 })
            })
          }
        >
          <CopyIcon size={16} />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Actions />
        <ScreenToggle source_name="video_screen" />
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
    </div>
  )
}
