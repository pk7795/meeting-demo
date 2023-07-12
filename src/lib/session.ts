import { AuthUser, SessionUser } from './api'
import { env } from './env'
import { getPrisma } from './prisma'
import { cookies } from 'next/headers'
import { UserRole, UserStatus } from '@prisma/client'

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = cookies()
  const tokenCookie = cookieStore.get('next-auth.session-token')
  if (!tokenCookie || !tokenCookie.value) return null
  const user = await getPrisma().user.findFirst({
    where: {
      sessions: {
        some: {
          sessionToken: tokenCookie.value,
        },
      },
    },
  })
  if (
    user &&
    user.email == env.SUPPER_ADMIN_EMAIL &&
    user.status != UserStatus.Actived &&
    user.role != UserRole.SuperAdmin
  ) {
    await getPrisma().user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.Actived,
        role: UserRole.SuperAdmin,
      },
    })
    user.status = UserStatus.Actived
    user.role = UserRole.SuperAdmin
  }
  return user as AuthUser | null
}
