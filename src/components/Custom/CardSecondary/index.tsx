'use client'

import { CardProps } from 'antd'

type Props = {
  children?: React.ReactNode
  title?: string | null
  description?: string | null
  extra?: React.ReactNode
} & CardProps

export const CardSecondary: React.FC<Props> = ({ children, title, description, extra, className }) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        {title && <div className="font-medium">{title}</div>}
        {extra}
      </div>
      {description && <p className="mb-3">{description}</p>}
      {children}
    </div>
  )
}
