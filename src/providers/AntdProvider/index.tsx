import { App, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { ReactNode } from 'react'

type Props = {
    children?: ReactNode
}

export default function AntdProvider({ children }: Props) {
    return (
        <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: '#3333ff' } }}>
            <App>{children}</App>
        </ConfigProvider>
    )
}
