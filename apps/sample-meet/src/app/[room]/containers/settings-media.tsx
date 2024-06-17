'use client'

import { useParams } from 'next/navigation'
import { useSession } from '@atm0s-media-sdk/react-hooks/lib'
import { CameraPreview, CameraSelection } from '@atm0s-media-sdk/react-ui/lib'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/index'
import { CopyIcon, MicOffIcon, Settings2Icon, VideoIcon } from '@repo/ui/icons/index'
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
        <CameraSelection source_name="video_main" first_page />
        <div className="flex items-center gap-4">
          <Button variant="destructive" size="icon">
            <MicOffIcon size={16} />
          </Button>
          <Button variant="secondary" size="icon">
            <VideoIcon size={16} />
          </Button>
          <Button variant="secondary" size="icon">
            <Settings2Icon size={16} />
          </Button>
          <Button variant="secondary" size="icon">
            <CopyIcon size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => {
            session.connect().then(() => {
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
