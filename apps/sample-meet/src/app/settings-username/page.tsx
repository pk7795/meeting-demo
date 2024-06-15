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

export default function SettingsUsernameScreen() {
  const router = useRouter()
  return (
    <Card className="w-full max-w-xs md:max-w-sm">
      <CardHeader>
        <CardTitle>
          <Logo />
        </CardTitle>
        <CardDescription>Enter your username to join the meeting</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="username" placeholder="Enter your username" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => router.push('/')}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
