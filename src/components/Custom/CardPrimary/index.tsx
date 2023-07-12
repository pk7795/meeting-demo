'use client'

import { Card, CardProps } from 'antd'
import classNames from 'classnames'

type Props = {
    children?: React.ReactNode
    title?: string
    description?: string
    extra?: React.ReactNode
} & CardProps

export const CardPrimary: React.FC<Props> = ({
    children,
    title,
    description,
    extra,
    hoverable,
    className,
    ...props
}) => {
    return (
        <Card
            className={classNames(
                'border border-gray-200',
                hoverable ? 'hover:shadow-sm cursor-pointer' : '',
                className
            )}
            {...props}
        >
            <div className="flex items-center justify-between mb-3">
                {title && <div className="font-semibold text-xl">{title}</div>}
                {extra}
            </div>
            {description && <p className="mb-3">{description}</p>}
            {children}
        </Card>
    )
}
