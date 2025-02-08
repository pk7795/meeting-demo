'use client'

import { createRoomParticipantGuestUser, createRoomParticipantLoginUser } from '@/app/actions'
import { CameraPreview, Logo, Username } from '@/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase } from '@/config/supabase'
import { RoomAccessStatus, UserType } from '@/lib/constants'
import { RoomPopulated } from '@/types/types'
import { RoomParticipant } from '@prisma/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { ChevronLeftIcon } from 'lucide-react'
import { useSession as useAuthSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { v4 } from 'uuid'
import { Actions } from './components'
type NameInputs = {
  userName: string
}
type Props = {
  onConnected: () => void
  room: RoomPopulated
  myParticipant: RoomParticipant | null
  setRoomParticipant: (participant: RoomParticipant) => void
  setPeerSession: (config: any) => void
  roomAccess: RoomAccessStatus
}

export const SettingsMedia: React.FC<Props> = ({
  onConnected,
  room,
  myParticipant,
  setRoomParticipant,
  setPeerSession,
  roomAccess,
}) => {
  const router = useRouter()
  const params = useParams()

  const { data: user, status } = useAuthSession()

  const [isLoading, setIsLoading] = useState(false)
  const [isPendingCreateRoomParticipant, startTransitionCreateRoomParticipant] = useTransition()
  const [acceptSubscription, setAcceptSubscription] = useState<RealtimeChannel>()
  const [access, setAccess] = useState<RoomAccessStatus | null>(roomAccess)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<NameInputs>()

  const guestUUID = useMemo(() => {
    return v4() + ':' + room.id
  }, [room.id])

  const onUserJoin = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      createRoomParticipantLoginUser({
        data: {
          passcode: room.passcode as string,
        },
      })
        .then(async ({ peerSession, roomParticipant }) => {
          setRoomParticipant(roomParticipant)
          setPeerSession(peerSession)
          onConnected()
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    })
  }, [onConnected, room.passcode, setPeerSession, setRoomParticipant])

  const onGuestJoin = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      createRoomParticipantGuestUser({
        data: {
          name: getValues('userName'),
          passcode: room.passcode as string,
        },
      })
        .then(({ peerSession, roomParticipant }) => {
          setRoomParticipant(roomParticipant)
          setPeerSession(peerSession)
          onConnected()
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    })
  }, [onConnected, room.passcode, setPeerSession, setRoomParticipant])

  const sendJoinRequest = useCallback(
    (id: string, name: string, type: string) => {
      // TODO: Refactor
      const roomChannel = supabase.channel(`room:${room.id}`)
      roomChannel.subscribe((status) => {
        console.log('AYO', status)
        if (status === 'SUBSCRIBED') {
          roomChannel
            .send({
              type: 'broadcast',
              event: 'ask',
              payload: {
                id,
                name,
                type,
                user: {
                  id: user?.user.id,
                  name: user?.user.name,
                  email: user?.user.image,
                },
              },
            })
            .then(() => {
              console.log('sendJoinRequest')
            })
            .catch((e) => {
              console.log('sendJoinRequest error: ', e)
            })

          setAccess(RoomAccessStatus.PENDING)
        }
      })
    },
    [room.id, user?.user.id, user?.user.image, user?.user.name]
  )
  const onJoin = useCallback(() => {
    setIsLoading(true)
    if (user) {
      onUserJoin()
    } else {
      onGuestJoin()
    }
  }, [onGuestJoin, onUserJoin, user])

  // useEffect(() => {
  //   setRoomAccessStatus(access)

  // }, [access])

  const onAsk = useCallback(() => {
    startTransitionCreateRoomParticipant(() => {
      if (user) {
        createRoomParticipantLoginUser({
          data: {
            passcode: room.passcode as string,
          },
        }).then(({ peerSession, roomParticipant }) => {
          setRoomParticipant(roomParticipant)
          setPeerSession(peerSession)
          sendJoinRequest(roomParticipant.id, user.user.name as string, UserType.User)
          setAcceptSubscription(
            supabase
              .channel(`${roomParticipant.id}:room:${room.id}`)
              .on('broadcast', { event: 'accepted' }, () => {
                setAccess(RoomAccessStatus.JOINED)
                onJoin()
              })
              .subscribe()
          )
        })
      } else {
        sendJoinRequest(guestUUID, getValues('userName'), UserType.Guest)
        setAcceptSubscription(
          supabase
            .channel(`${guestUUID}:room:${room.id}`)
            .on('broadcast', { event: 'accepted' }, () => {
              setAccess(RoomAccessStatus.JOINED)
              onJoin()
            })
            .subscribe()
        )
      }
    })
  }, [guestUUID, watch, onJoin, room.id, room.passcode, sendJoinRequest, setPeerSession, setRoomParticipant, user])

  const renderJoinButton = () => {
    switch (access) {
      case RoomAccessStatus.PENDING:
        return (
          <Button loading={true} className="w-full flex-1" disabled={true} variant={'default'}>
            Waiting for host to accept
          </Button>
        )
      case RoomAccessStatus.JOINED:
        return (
          <Button
            onClick={handleSubmit(onJoin)}
            loading={isPendingCreateRoomParticipant}
            className="w-full flex-1"
            variant={'default'}
          >
            Join
          </Button>
        )
      case RoomAccessStatus.NEED_ASK:
        return (
          <Button
            loading={isPendingCreateRoomParticipant}
            onClick={handleSubmit(onAsk)}
            variant={'default'}
            className="w-full flex-1"
            disabled={false}
          >
            Ask to join
          </Button>
        )
      default:
        return <Button loading={true} className="w-full flex-1" disabled={true} variant={'default'} />
    }
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-xs md:max-w-sm">
        <CardHeader>
          <CardTitle>
            <Logo />
          </CardTitle>
          <CardDescription>
            {user ? (
              <Username />
            ) : (
              <div className="mt-8 space-y-2">
                <label
                  htmlFor="room-code"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enter your name to start!
                </label>
                <div className="flex gap-2">
                  <Input
                    id="room-code"
                    placeholder="Enter your name"
                    className="w-full border-primary/20 bg-background/50 transition-shadow duration-200 focus:border-primary focus:shadow-md"
                    {...register('userName', { required: true })}
                  />
                </div>
                {errors.userName && <span className="text-xs text-red-500">This field is required</span>}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Room ID: {params?.room}</div>
            <CameraPreview sourceName="video_main" />
          </div>
          <div className="flex items-center gap-4">
            <Actions isFirstPage />
          </div>
        </CardContent>
        <CardFooter className="gap-4">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => {
              router.replace('/')
            }}
          >
            <ChevronLeftIcon size={16} />
          </Button>
          {renderJoinButton()}
        </CardFooter>
      </Card>
    </div>
  )
}
