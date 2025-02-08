'use client'

import { generateToken } from '@/app/actions/token'
import { Layout } from '@/layouts'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { createRoom } from '@/app/actions/room'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { supabase } from '@/config'
import { generateRandomString } from '@/lib'
import { RoomStore } from '@/stores/room'
import { RoomInvite } from '@prisma/client'
import { IconBrandGoogle } from '@tabler/icons-react'
import { useSetAtom } from 'jotai'
import { ArrowRight, Copy, CopyCheck, Link, Loader, Plus } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useCopyToClipboard } from 'usehooks-ts'
type Inputs = {
  roomCode: string
  roomName: string
}

export type OneRoomInvite = {
  id: string
  roomId: string
  email: string
  createdAt: Date
  updatedAt: Date
  validUntil: Date
  room: {
    id: string
    name: string
    passcode: string | null
    record: boolean
    ownerId: string
    createdAt: Date
    updatedAt: Date
  }
}

export type OneMyRooms = {
  id: string
  name: string
  passcode: string | null
  record: boolean
  ownerId: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
type Props = {
  roomInvite: OneRoomInvite[] | null
  // myRooms: OneMyRooms[] | null
}

export const NewRoom: React.FC<Props> = ({ roomInvite }: Props) => {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Inputs>()
  const [isPendingCreateRoom, startTransitionCreateRoom] = useTransition()
  const [isLoadingJoin, setIsLoadingJoin] = useState(false)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [isCopy, setIsCopy] = useState(false)
  const [, onCopy] = useCopyToClipboard()
  const [roomSave, setRoomSave] = useState('')
  const [activeTab, setActiveTab] = useState('join')
  const [invites, setInvites] = useState<OneRoomInvite[] | null>(roomInvite)

  const onCreateRoomUseLater = useSetAtom(RoomStore.createRoomUseLater)

  const onGenerateToken = async (room: string) => {
    const token = await generateToken(room, user?.id as string)
    return router.push(`/${room}`)
  }

  const onJoin: SubmitHandler<Inputs> = async (data) => {
    setIsLoadingJoin(true)
    router.push(`/${data.roomCode}`)
    setIsLoadingJoin(false)
  }

  const onCreate: SubmitHandler<Inputs> = async (data) => {
    setIsLoadingCreate(true)
    startTransitionCreateRoom(() => {
      createRoom({
        data: {
          name: data.roomCode,
        },
      }).then((room) => {
        if (room?.passcode) {
          router.push(`/${room?.passcode}`)
        } else {
          alert('Error while creating room. Please try again later.')
        }
      })
    })
    setIsLoadingCreate(false)
  }

  const onCreateMeetRoom: SubmitHandler<Inputs> = async (data) => {
    onCreateRoomUseLater({
      code: data.roomCode,
      name: getValues('roomName'),
      users: [],
    })
    setIsLoadingCreate(true)
    startTransitionCreateRoom(() => {
      createRoom({
        data: {
          name: data.roomCode,
        },
      }).then((room) => {
        if (room?.passcode) {
          router.push(`/${room?.passcode}`)
        } else {
          alert('Error while creating room. Please try again later.')
        }
      })
    })
    setRoomSave(data.roomCode)
    setIsLoadingCreate(false)
  }

  const copyToClipboardMeetingLink = async (value: string) => {
    setIsCopy(true)
    await onCopy(value as string)
    setTimeout(() => {
      setIsCopy(false)
    }, 2000)
  }

  const meetingLink = useMemo(() => `${window?.origin}/${roomSave}`, [roomSave])

  const onNewInvite = useCallback(
    async (invite: RoomInvite) => {
      const room = await supabase.from('Room').select('*').eq('id', invite.roomId).single()

      const roomInvite = { ...invite, room: room.data }

      if (invites) {
        setInvites([...invites, roomInvite])
      } else {
        setInvites([roomInvite])
      }
    },
    [invites]
  )
  useEffect(() => {
    if (user) {
      const roomInviteSubscription = supabase
        .channel('room-invite:' + user!.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'RoomInvite',
            filter: 'email=eq.' + user!.email,
          },
          (payload: { new: RoomInvite }) => onNewInvite(payload.new)
        )
        .subscribe()

      return () => {
        roomInviteSubscription?.unsubscribe()
      }
    }
  }, [onNewInvite, user])
  return (
    <Layout>
      <div className="flex h-screen w-full items-center justify-center md:flex lg:grid">
        <div className="mx-auto grid gap-6">
          <form onSubmit={handleSubmit(onJoin)} className="flex-1">
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center justify-center p-4 sm:p-6">
                <Card className="w-full max-w-md overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 shadow-xl backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-2 text-center">
                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-bold text-transparent">
                      Ermis Meet
                    </CardTitle>
                    <CardDescription className="mt-2 text-lg text-foreground/80">A technical demo of Ermis</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {!session ? (
                      <div className="space-y-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="group w-full">
                              Sign in <span className="hidden md:inline">to start meeting</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                              >
                                <Button
                                  loading={isLoadingCreate}
                                  className="h-full w-full justify-start p-0 font-normal"
                                  variant="ghost"
                                >
                                  <IconBrandGoogle size={16} />
                                  <div className="ml-2 text-sm">Continue with Google</div>
                                </Button>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="room-name"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Room Name
                          </label>
                          <Input
                            id="room-name"
                            placeholder="Enter room name"
                            className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md"
                            {...register('roomName')}
                          />
                        </div>

                        <Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="group w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                Create Room
                                <Plus className="ml-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72">
                              <DropdownMenuGroup>
                                <DropdownMenuItem className="cursor-pointer">
                                  <DialogTrigger
                                    asChild
                                    onClick={() =>
                                      onCreateMeetRoom({
                                        roomCode: generateRandomString(8),
                                        roomName: '',
                                      })
                                    }
                                  >
                                    <div className="flex flex-1 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
                                      <Link />
                                      Create a meeting for later use
                                    </div>
                                  </DialogTrigger>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    onCreate({
                                      roomCode: generateRandomString(8),
                                      roomName: '',
                                    })
                                  }
                                >
                                  <Button
                                    loading={isLoadingCreate}
                                    className="h-full w-full justify-start p-0 font-normal"
                                    variant="ghost"
                                  >
                                    <Plus />
                                    Start an instant meeting
                                  </Button>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Here is information on how to participate.</DialogTitle>
                              <DialogDescription>
                                Send this link to the people you want to meet with. Save the link for later use.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {isLoadingCreate && <Loader />}

                              {!isLoadingCreate && (
                                <div className="flex h-10 items-center gap-2 rounded bg-zinc-200 pl-3">
                                  <div className="flex-1 text-sm">{meetingLink}</div>
                                  <Button variant="link" size="icon" onClick={() => copyToClipboardMeetingLink(meetingLink)}>
                                    {isCopy ? <CopyCheck size={16} className="text-green-500" /> : <Copy size={16} />}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    <div className="mt-8 space-y-2">
                      <label
                        htmlFor="room-code"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Join a meeting now:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="room-code"
                          placeholder="Enter room code"
                          className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md"
                          {...register('roomCode', { required: true })}
                        />
                        <Button loading={isLoadingJoin} type="submit" variant={'outline'}>
                          Join
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                      {errors.roomCode && <span className="text-xs text-red-500">This field is required</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
        {/* {!session && <div className="hidden bg-muted lg:block">
          <img src={ImgSignInBg} alt="" className="h-screen w-full object-cover" />
        </div>} */}
      </div>
    </Layout>
  )
}
