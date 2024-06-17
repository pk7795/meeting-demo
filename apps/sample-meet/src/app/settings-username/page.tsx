'use client'

import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
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
import { setCookie } from '@repo/ui/lib/cookies'
import { Logo } from '@/components'

type Inputs = {
  username: string
}

export default function SettingsUsernameScreen() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setCookie('username', data.username, 7)
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs md:max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>Enter your username to join the meeting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="username"
              placeholder="Enter your username"
              {...register('username', { required: true })}
            />
            {errors.username && <span className="text-xs text-red-500">This field is required</span>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
