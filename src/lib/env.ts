import { LogLevel } from '@8xff/atm0s-media-react'

export const env = {
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
  PUBLIC_URL: (process.env.PUBLIC_URL || process.env.NEXTAUTH_URL) as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  JWT_SECRET: process.env.NEXTAUTH_SECRET as string,
  GITHUB_ID: process.env.GITHUB_ID as string,
  GITHUB_SECRET: process.env.GITHUB_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  ATM0S_CONFIG: {
    api: process.env.ATM0S_API as string,
    gateway: process.env.ATM0S_GATEWAY as string,
    appToken: process.env.ATM0S_APP_TOKEN as string,
    logLevel: parseInt(process.env.ATM0S_LOG_LEVEL || '2') as LogLevel,
  },
} as const
