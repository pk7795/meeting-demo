'use client'

import { Logo } from '@/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setCookie } from '@/lib'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'

type Inputs = {
  username: string
}

export const SettingsUsername = () => {
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
    <div className="flex h-screen items-center justify-center">
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
    </div>
  )
}
