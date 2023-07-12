import '../styles/globals.scss'
import { Inter } from 'next/font/google'
import { AppProvider } from '@/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bluesea Broadcast',
  description: 'Bluesea Broadcast',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
