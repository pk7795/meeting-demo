'use client'

import { Card, CardProps } from 'antd'
import classNames from 'classnames'

type Props = {
    children?: React.ReactNode
} & CardProps

export const CardInfo: React.FC<Props> = ({ children, className, ...props }) => {
    return (
        <Card className={classNames('bg-gray_1 border border-gray-200', className)} {...props}>
            {children}
        </Card>
    )
}
