'use client'

import { generateToken } from '@/app/actions/token'
import { Logo } from '@/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Layout } from '@/layouts'
import { setCookie } from '@/lib'
import { LoaderCircleIcon } from 'lucide-react'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

type Inputs = {
  username: string
}

type Props = {
  username?: RequestCookie
}

export const Invite: React.FC<Props> = ({ username }) => {
  const params = useParams()

  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setCookie('username', data.username, 7)
    router.refresh()
  }

  const onGenerateToken = useCallback(async () => {
    const room = params.room as string
    const token = await generateToken(room, username?.value as string)
    return router.push(`/${room}?gateway=0&peer=${username?.value}&token=${token}`)
  }, [params.room, router, username])

  useEffect(() => {
    if (username) {
      onGenerateToken()
    }
  }, [onGenerateToken, params.room, router, username])

  return (
    <Layout>
      {!username ? (
        <div className="flex items-center justify-center">
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
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
        </div>
      )}
    </Layout>
  )
}
