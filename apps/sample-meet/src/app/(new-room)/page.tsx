'use client'

import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui/components/index'
import { Logo } from '@/components'

export default function NewRoomScreen() {
  const router = useRouter()
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
        <Button className="w-full" variant="destructive">
          Create new room
        </Button>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 border-t" />
          <div className="text-sm">Or join a room</div>
          <div className="flex-1 border-t" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="room">Room ID</Label>
          <Input id="room" type="room" placeholder="Enter room id" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => router.push('/1234-5678')}>
          Join
        </Button>
      </CardFooter>
    </Card>
  )
}
