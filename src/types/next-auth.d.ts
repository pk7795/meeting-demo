import type { User } from 'next-auth'
import { UserRole, UserStatus } from '@prisma/client'

interface ChatSession {
  userId: string
  accessToken: string
  projectId: string
  gUserId: string
  refreshToken: string
}
declare module 'next-auth' {
  interface Session {
    user: User
    accessToken: string
    refreshToken: string
    expires: string
    chat: ChatSession
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
