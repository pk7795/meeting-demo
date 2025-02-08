'use server'
import { env } from '@/config'
import { UserRole, UserStatus } from '@prisma/client'
import { cookies } from 'next/headers'
import { AuthUser } from './api'
import { getPrisma } from './prisma'

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token')
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
  if (user && user.email == env.SUPER_ADMIN_EMAIL && user.status != UserStatus.Actived && user.role != UserRole.SuperAdmin) {
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

export async function getToken() {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('next-auth.session-token') || cookieStore.get('__Secure-next-auth.session-token')
  if (!tokenCookie || !tokenCookie.value) return null

  return tokenCookie.value
}
