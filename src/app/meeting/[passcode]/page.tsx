import { UserRole, UserStatus } from '@prisma/client'
import { Meeting } from '@/containers'
import { getPrisma, getSessionUser } from '@/lib'

export type OneUserInvite = {
    id: string
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    role: UserRole
    status: UserStatus
    createdAt: Date
    updatedAt: Date
}

export default async function IndexMeeting() {
    const prisma = getPrisma()
    const session = await getSessionUser()
    const userInvite = await prisma.user.findMany({
        where: {
            id: {
                not: session?.id,
            },
        },
    })

    return <Meeting userInvite={userInvite} />
}
