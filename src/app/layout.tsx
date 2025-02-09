import './global.scss'
import { AppProvider } from '@/providers'
import localFont from 'next/font/local'
import type { Metadata } from 'next'
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
  title: 'Ermis Meet',
  description: 'Ermis Meet',
  icons: 'icon.ico',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} id="id--full-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
