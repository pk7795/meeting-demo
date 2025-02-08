import './global.scss'
// import 'antd/dist/reset.css'
import { AppProvider } from '@/providers'
import localFont from 'next/font/local'
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
export const metadata = {
  title: 'Ermis Meet',
  description: 'Ermis Meet',
  icons: 'icon.ico',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} id="id--full-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
