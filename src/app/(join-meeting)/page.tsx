import { JoinMeeting } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'

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

export default async function IndexJoinMeeting() {
    const prisma = getPrisma()
    const session = await getSessionUser()
    const roomInvite = await prisma.roomInvite.findMany({
        where: {
            email: {
                equals: session?.email,
            },
        },
        include: {
            room: true,
        },
    })

    return <JoinMeeting roomInvite={roomInvite} />
}
