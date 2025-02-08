
import { CameraToggleV2 } from '@/components/media/camera'
import { MicrophoneToggleV2 } from '@/components/media/microphone'
import { ScreenToggleV2 } from '@/components/media/screen'
import BlurFade from '@/components/ui/blur-fade'
import { Button } from '@/components/ui/button'
// import { useSidebar } from '@/components/ui/sidebar'
// import { useFullScreen } from '@/hooks/use-full-screen'
import { MaximizeIcon, MinimizeIcon, PhoneMissedIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'

type Props = {}

export const BottomBarV2: React.FC<Props> = () => {
  // const { isMaximize, onOnOffFullScreen } = useFullScreen()
  const router = useRouter()
  // const { setOpen } = useSidebar()

  // const onToggleFullScreen = useCallback(() => {
  //   setOpen(isMaximize)
  //   onOnOffFullScreen()
  // }, [isMaximize, onOnOffFullScreen, setOpen])

  return (
    <BlurFade
      key={'zoom-footer'}
      duration={0.2}
      yOffset={4}
      className={'absolute -bottom-1 z-10 h-fit w-full rounded-b-2xl bg-gradient-to-t from-foreground/50 to-transparent p-4'}
    >
      <div className={'relative py-2'}>
        <div className={'mx-auto flex h-11 w-max items-start gap-2'}>
          <MicrophoneToggleV2 sourceName={'audio_main'} />
          <CameraToggleV2 sourceName={'video_main'} />
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

        {/* <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullScreen}
          className={'absolute bottom-0 right-0 h-7 w-7 text-background'}
        >
          {!isMaximize ? <MaximizeIcon size={16} /> : <MinimizeIcon size={16} />}
        </Button> */}
      </div>
    </BlurFade >
  )
}
