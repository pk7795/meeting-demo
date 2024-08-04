/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  transpilePackages: ['@atm0s-media-sdk/ui', '@atm0s-media-sdk/core', '@atm0s-media-sdk/react-hooks', '@atm0s-media-sdk/react-ui'],
}

export default nextConfig
