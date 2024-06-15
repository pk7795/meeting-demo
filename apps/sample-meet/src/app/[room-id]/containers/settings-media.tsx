'use client'

import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/index'
import { CopyIcon, MicOffIcon, Settings2Icon, VideoIcon } from '@repo/ui/icons/index'
import { Logo } from '@/components'

export const SettingsMedia = () => {
  return (
    <Card className="w-full max-w-xs md:max-w-sm">
      <CardHeader>
        <CardTitle>
          <Logo />
        </CardTitle>
        <CardDescription>
          Logged in as Cao Havan | <span className="underline cursor-pointer">Logout</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Room ID: 1234-5678</div>
          <img src="https://picsum.photos/200" alt="" className="w-full aspect-video rounded-lg object-cover" />
          <div className="text-sm text-muted-foreground">0 user(s) in the room</div>
        </div>
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
        <Button className="w-full">Join</Button>
      </CardFooter>
    </Card>
  )
}
