'use server'

import { RoomInput } from './types'
import { getPrisma, getSessionUser } from '@/lib'
import { genPasscode } from '@/utils'

export async function createRoom({ data }: { data: RoomInput }) {
    const prisma = getPrisma()
    const session = await getSessionUser()

    const res = await prisma.room.create({
        data: {
            ...data,
            passcode: genPasscode(),
            ownerId: session?.id as string,
        },
    })
    await prisma.roomParticipant.create({
        data: {
            ...data,
            roomId: res?.id as string,
            userId: session?.id as string,
        },
    })
    return res
}
