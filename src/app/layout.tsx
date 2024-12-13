import './global.scss'
import 'antd/dist/reset.css'
import { AppProvider } from '@/providers'

export const metadata = {
  title: 'Ermis Meet',
  description: 'Ermis Meet',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
