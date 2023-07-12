'use client'

import { Button, ButtonProps, Tooltip } from 'antd'
import classNames from 'classnames'

type Props = {
  children?: React.ReactNode
  icon?: React.ReactNode
  tooltip?: string
  disabled?: boolean
  onClick?: any
} & ButtonProps

export const ButtonIcon: React.FC<Props> = ({ children, icon, tooltip, className, disabled, onClick, ...props }) => {
  return (
    <Tooltip title={tooltip}>
      <Button
        type="text"
        size="small"
        icon={icon}
        className={classNames(
          'flex items-center justify-center',
          disabled ? 'cursor-not-allowed bg-[#0000000a] border-[#d9d9d9] text-[#00000040]' : '',
          className
        )}
        onClick={(e) => {
          if (disabled) return
          onClick?.(e)
        }}
        {...props}
      >
        {children}
      </Button>
    </Tooltip>
  )
}
