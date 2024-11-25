'use client'

import { generateToken } from '@/app/actions/token'
import { Logo, Username } from '@/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { env } from '@/config'
import { Layout } from '@/layouts'
import { generateRandomString } from '@/lib'
import { isCreateNewRoomState } from '@/recoils'
import { map } from 'lodash'
import { LoaderIcon } from 'lucide-react'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { redirect, useRouter } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useSetRecoilState } from 'recoil'

type Inputs = {
  room: string
}

type Props = {
  username?: RequestCookie
}

export const NewRoom: React.FC<Props> = ({ username }) => {
  if (!username) {
    redirect('/settings-username')
  }

  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()
  const [gatewayIndex, setGatewayIndex] = useState('0')
  const [isLoadingJoin, setIsLoadingJoin] = useState(false)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const setIsCreateNewRoom = useSetRecoilState(isCreateNewRoomState)

  const gateways = env.GATEWAYS

  const onGenerateToken = async (room: string) => {
    const token = await generateToken(room, username?.value as string)
    return router.push(`/${room}?gateway=${gatewayIndex}&peer=${username?.value}&token=${token}`)
  }

  const onJoin: SubmitHandler<Inputs> = async (data) => {
    setIsLoadingJoin(true)
    await onGenerateToken(data.room)
    setIsLoadingJoin(false)
  }

  const onCreate: SubmitHandler<Inputs> = async (data) => {
    setIsCreateNewRoom(true)
    setIsLoadingCreate(true)
    await onGenerateToken(data.room)
    setIsLoadingCreate(false)
  }

  if (!username) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-center">
        <form onSubmit={handleSubmit(onJoin)} className="w-full max-w-xs md:max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>
                <Logo />
              </CardTitle>
              <CardDescription>
                <Username username={username} />
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Select value={gatewayIndex} onValueChange={setGatewayIndex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {map([gateways], (gateway, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {gateway}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                loading={isLoadingCreate}
                type="button"
                className="w-full"
                variant="destructive"
                onClick={() =>
                  onCreate({
                    room: generateRandomString(8),
                  })
                }
              >
                Create new room
              </Button>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 border-t" />
                <div className="text-sm">Or join a room</div>
                <div className="flex-1 border-t" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Room ID</Label>
                <Input id="room" type="room" placeholder="Enter room id" {...register('room', { required: true })} />
                {errors.room && <span className="text-xs text-red-500">This field is required</span>}
              </div>
            </CardContent>
            <CardFooter>
              <Button loading={isLoadingJoin} type="submit" className="w-full">
                Join
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  )
}
