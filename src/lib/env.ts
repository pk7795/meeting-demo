export const env = {
  SUPPER_ADMIN_EMAIL: process.env.SUPPER_ADMIN_EMAIL as string,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
  PUBLIC_URL: (process.env.PUBLIC_URL || process.env.NEXTAUTH_URL) as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  JWT_SECRET: process.env.NEXTAUTH_SECRET as string,
  GITHUB_ID: process.env.GITHUB_ID as string,
  GITHUB_SECRET: process.env.GITHUB_SECRET as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
} as const
