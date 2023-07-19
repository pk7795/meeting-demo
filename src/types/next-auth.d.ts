import type { User } from 'next-auth'
import { UserRole, UserStatus } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: User
    accessToken: string
    refreshToken: string
    expires: string
  }

  interface User {
    id: string
    status: UserStatus
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    user: User
  }
}
