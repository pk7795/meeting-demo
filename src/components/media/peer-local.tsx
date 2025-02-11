import { Button } from '@/components/ui/button'
import { usePinnedParticipant } from '@/containers/Meeting/contexts'
import { useDeviceStream } from '@/hooks'
import { useRoom } from '@atm0s-media-sdk/react-hooks'
import { slice } from 'lodash'
import { Pin, PinOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

type Props = {
  // sourceName: string
  userName: string | undefined
}

export const PeerLocal: React.FC<Props> = ({ userName }) => {
  const streamVideoMain = useDeviceStream('video_main')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamVideoScreen = useDeviceStream('video_screen')

  const { data: session } = useSession()
  const user = session?.user
  const name = user?.name || userName

  const room = useRoom()
  const [pinnedParticipant, setPinnedParticipant] = usePinnedParticipant()
  const isPinned = pinnedParticipant?.p.peer === room?.peer
  const onPin = () => {
    setPinnedParticipant(isPinned ? null : { p: room as any, force: true, name })
  }


  const firstNameInitials = slice(name, 0, 1).join('')
  // const lastNameInitials = slice(user?.lastName, 0, 1).join('')
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = streamVideoScreen || streamVideoMain || null
      return () => {
        if (videoRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          videoRef.current.srcObject = null
        }
      }
    }
  }, [streamVideoMain, streamVideoScreen])

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-800">
      <div className="absolute bottom-3 left-2 z-[1] flex items-center gap-1">
        <div className="rounded-full bg-[#191B23] bg-opacity-30 px-2 py-0.5 text-sm text-white">
          {name || 'You'} {streamVideoScreen && `(You, presenting)`}
        </div>
      </div>
      <Button
        onClick={onPin}
        variant={!isPinned ? 'outline' : 'blue'}
        size="icon"
        className={'absolute right-2 top-2 z-[2] h-7 w-7 text-background'}
      >
        {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
      </Button>
      {streamVideoMain || streamVideoScreen ? (
        <div className="relative h-full w-full overflow-hidden">
          <video
            muted
            autoPlay
            playsInline
            controls={false}
            className="absolute inset-0 h-full w-full object-contain"
            ref={videoRef}
            style={{
              transform: !streamVideoScreen ? 'rotateY(180deg)' : 'none',
            }}
          />
        </div>
      ) : (
        <Avatar className="w-1/3 rounded-full">
          <AvatarImage src={user?.image || ""} alt={name} />
          <AvatarFallback className="rounded-full">{firstNameInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
