'use client'

import { generateToken } from '../actions/token'
import { map } from 'lodash'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@atm0s-media-sdk/ui/components/index'
import { generateRandomString } from '@atm0s-media-sdk/ui/lib/common'
import { getCookie } from '@atm0s-media-sdk/ui/lib/cookies'
import { Logo, Username } from '@/components'
import { env } from '@/config/env'

type Inputs = {
  room: string
}

export default function NewRoomScreen() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()
  const [gatewayIndex, setGatewayIndex] = useState('0')

  const username = getCookie('username')
  const gateways = env.GATEWAYS

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const room = data.room
    const peer = username
    const token = await generateToken(room, peer)
    router.push(`/${room}?gateway=${gatewayIndex}&peer=${peer}&token=${token}`)
  }
  const onCreateNewRoom = async () => {
    const room = generateRandomString(8)
    const peer = username
    const token = await generateToken(room, peer)
    router.push(`/${room}?gateway=${gatewayIndex}&peer=${peer}&token=${token}`)
  }

  useEffect(() => {
    if (!username) {
      router.push('/settings-username')
    }
  }, [router, username])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xs md:max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>
            <Username />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Select value={gatewayIndex} onValueChange={setGatewayIndex}>
            <SelectTrigger>
              <SelectValue placeholder="Select gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {map(gateways, (gateway, index) => (
                  <SelectItem key={index} value={String(index)}>{gateway}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="button" className="w-full" variant="destructive" onClick={onCreateNewRoom}>
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
          <Button type="submit" className="w-full">
            Join
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
