'use client'

import { App, ConfigProvider, theme } from 'antd'
import enUS from 'antd/locale/en_US'
import { ReactNode } from 'react'
import { useRecoilValue } from 'recoil'
import { themeState } from '@/recoil'

type Props = {
  children?: ReactNode
}

export default function AntdProvider({ children }: Props) {
  const getTheme = useRecoilValue(themeState)
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        token: { colorPrimary: '#2D8CFF' },
        algorithm: getTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}
