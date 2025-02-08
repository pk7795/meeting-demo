import type { NextConfig } from 'next'
import intercept from 'intercept-stdout'

const interceptStdout = (text: string): string => {
  if (text.includes('Duplicate atom key')) {
    return ''
  }
  return text
}

if (process.env.NODE_ENV === 'development') {
  intercept(interceptStdout)
}

const nextConfig: NextConfig = {
  // serverActions is enabled by default in Next.js 14+
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ERMIS_CHAT_API: process.env.ERMIS_CHAT_API,
    ERMIS_CHAT_API_KEY: process.env.ERMIS_CHAT_API_KEY,
  },
}

export default nextConfig