import './global.scss'
import 'antd/dist/reset.css'
import { AppProvider } from '@/providers'

export const metadata = {
  title: 'Bluesea Meet',
  description: 'Bluesea Meet',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark_ebony">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
