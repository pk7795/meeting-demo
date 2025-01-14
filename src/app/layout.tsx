import { AppProvider } from '@/providers'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Ermis - Meet',
  description: 'Meet new people, make new friends, and have fun!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in">
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} id="id--full-screen">
          <AppProvider>{children}</AppProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
