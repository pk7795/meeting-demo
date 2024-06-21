'use client'

import { Actions } from '../components'
import { useParams } from 'next/navigation'
import { useSession } from '@atm0s-media-sdk/react-hooks/lib'
import { CameraPreview } from '@atm0s-media-sdk/react-ui/lib'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@atm0s-media-sdk/ui/components/index'
import { Logo, Username } from '@/components'

type Props = {
  onConnected: () => void
}

export const SettingsMedia: React.FC<Props> = ({ onConnected }) => {
  const params = useParams()
  const session = useSession()

  return (
    <Card className="w-full max-w-xs md:max-w-sm">
      <CardHeader>
        <CardTitle>
          <Logo />
        </CardTitle>
        <CardDescription>
          <Username />
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Room ID: {params?.room}</div>
          <CameraPreview source_name="video_main" />
          <div className="text-sm text-muted-foreground">0 user(s) in the room</div>
        </div>
        <div className="flex items-center gap-4">
          <Actions first_page />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => {
            session.connect().then(() => {
              const audio = new Audio('/sound-in.mp3')
              audio.play()
              onConnected()
            })
          }}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  )
}
