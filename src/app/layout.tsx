import { Inter } from 'next/font/google'
import { AppProvider } from '@/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bluesea Meet',
  description: 'Bluesea Meet',
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
