import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '@atm0s-media-sdk/ui/globals.css'
import { ThemeProvider } from '@atm0s-media-sdk/ui/providers/index'
import { MainLayout } from '@/layouts'
import { Toaster } from 'sonner'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: '8xFF - Sample Meets',
  description: 'Sample Meets is a sample application built with 8xFF.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
