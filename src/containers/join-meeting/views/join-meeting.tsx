'use client'


import { ArrowRight, Copy, CopyCheck, Link, Loader, Plus, } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { RoomInvite } from '@prisma/client'
import { IconBrandGoogle } from '@tabler/icons-react'
import { OneMyRooms, OneRoomInvite } from '@/app/(join-meeting)/page'
import { createRoom } from '@/app/actions'
import { supabase } from '@/config/supabase'
import { GlobalContextProvider } from '@/contexts'
import { MainLayout } from '@/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmitHandler, useForm } from 'react-hook-form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCopyToClipboard } from 'usehooks-ts'
import { Input } from '@/components/ui/input'


type PassCodeInput = {
  passCode: string
}
type RoomNameInput = {
  roomName: string
}
type Props = {
  roomInvite: OneRoomInvite[] | null
  myRooms: OneMyRooms[] | null
}

export const WrappedJoinMeeting = ({ roomInvite, myRooms }: Props) => (
  <GlobalContextProvider>
    <JoinMeeting roomInvite={roomInvite} myRooms={myRooms} />
  </GlobalContextProvider>
)

export const JoinMeeting: React.FC<Props> = ({ roomInvite }) => {
  const router = useRouter()
  const [isLoadingJoin, setIsLoadingJoin] = useState(false)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)

  const { data: user } = useSession()
  const [, startTransitionCreateRoom] = useTransition()
  const [invites, setInvites] = useState<OneRoomInvite[] | null>(roomInvite)
  const [passCode, setPassCode] = useState<string | null>(null)
  const [isCopy, setIsCopy] = useState(false)
  const [, onCopy] = useCopyToClipboard()
  const baseUrl = window.location.origin
  const meetingLink = `${baseUrl}/${passCode}`

  const [openDialog, setOpenDialog] = useState(false);
  const {
    register: registerJoinRoom,
    handleSubmit: handleSubmitJoinRoom,
    formState: { errors: errorsJoinRoom },
  } = useForm<PassCodeInput>({
    defaultValues: { passCode: '' },
    mode: 'onChange',
  })
  const {
    register: registerCreateRoom,
    handleSubmit: handleSubmitCreateRoom,
    formState: { errors: errorsCreateRoom },
    getValues: getValuesCreateRoom,
  } = useForm<RoomNameInput>({
    defaultValues: { roomName: '' },
    mode: 'onChange',
  })

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
  const onCreate = async () => {
    setIsLoadingCreate(true)
    startTransitionCreateRoom(() => {
      createRoom({
        data: {
          name: getValuesCreateRoom('roomName'),
        },
      }).then((room) => {
        if (room?.passcode) {
          setPassCode(room.passcode)
          setOpenDialog(true)
        } else {
          alert('Error while creating room. Please try again later.')
        }
      })
    })
    setIsLoadingCreate(false)
  }

  const onCreateMeetRoom = async () => {
    setIsLoadingCreate(true)
    startTransitionCreateRoom(() => {
      createRoom({
        data: {
          name: getValuesCreateRoom('roomName'),
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

  const onJoinRoom: SubmitHandler<PassCodeInput> = async (data) => {
    setIsLoadingJoin(true)
    router.push(`/${data.passCode}`)
    setIsLoadingJoin(false)
  }

  const copyToClipboardMeetingLink = async (value: string) => {
    setIsCopy(true)
    await onCopy(value as string)
    setTimeout(() => {
      setIsCopy(false)
    }, 2000)
  }


  useEffect(() => {
    if (user) {
      const roomInviteSubscription = supabase
        .channel('room-invite:' + user!.user!.id)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'RoomInvite',
            filter: 'email=eq.' + user!.user!.email,
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
    <MainLayout>
      <div className="flex h-screen w-full items-center justify-center md:flex lg:grid">
        <div className="mx-auto grid gap-6">
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
                  {!user ? (
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
                          className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md placeholder:text-muted-foreground dark:placeholder:text-white/50"
                          {...registerCreateRoom('roomName', { required: true })}
                        />
                        {errorsCreateRoom.roomName && <span className="text-xs text-red-500">This field is required</span>}
                      </div>

                      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
                                  onClick={handleSubmitCreateRoom(onCreate)}
                                >
                                  <div className="flex flex-1 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
                                    <Link />
                                    Create a meeting for later use
                                  </div>
                                </DialogTrigger>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={handleSubmitCreateRoom(onCreateMeetRoom)}
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
                              <div className="flex h-10 items-center gap-2 rounded bg-accent pl-3">
                                <div className="flex-1 text-mutedV2 text-sm">{meetingLink}</div>
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
                        className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md placeholder:text-muted-foreground dark:placeholder:text-white/50"
                        {...registerJoinRoom('passCode', { required: true })}
                      />
                      <Button loading={isLoadingJoin} onClick={handleSubmitJoinRoom(onJoinRoom)} variant={'default'}>
                        Join
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                    {errorsJoinRoom.passCode && <span className="text-xs text-red-500">This field is required</span>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
