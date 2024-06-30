export const env = {
  GATEWAYS: ((process.env.NEXT_PUBLIC_GATEWAYS as string) || 'http://localhost:3000').split(';'),
  APP_SECRET: (process.env.APP_SECRET as string) || 'insecure',
}
