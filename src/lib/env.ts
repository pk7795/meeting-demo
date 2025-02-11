

export const env = {
  GATEWAYS: (process.env.NEXT_PUBLIC_GATEWAYS as string) || 'http://localhost:3000',
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
  PUBLIC_URL: (process.env.PUBLIC_URL || process.env.NEXTAUTH_URL) as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  JWT_SECRET: process.env.NEXTAUTH_SECRET as string,
  GITHUB_ID: process.env.GITHUB_ID as string,
  GITHUB_SECRET: process.env.GITHUB_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  APP_SECRET: process.env.APP_SECRET as string,
  ERMIS_CHAT_API: process.env.ERMIS_CHAT_API as string,
  ERMIS_CHAT_API_KEY: process.env.ERMIS_CHAT_API_KEY,
} as const
