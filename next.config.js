/** @type {import('next').NextConfig} */

const intercept = require('intercept-stdout')

const interceptStdout = (text) => {
  if (text.includes('Duplicate atom key')) {
    return ''
  }
  return text
}

if (process.env.NODE_ENV === 'development') {
  intercept(interceptStdout)
}

const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ERMIS_CHAT_API: process.env.ERMIS_CHAT_API,
    ERMIS_CHAT_API_KEY: process.env.ERMIS_CHAT_API_KEY,
  },
}

module.exports = nextConfig
