import { AppProvider } from '@/providers'
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
  icons: 'icon.ico',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} id="id--full-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
