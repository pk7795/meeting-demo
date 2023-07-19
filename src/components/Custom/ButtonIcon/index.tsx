'use client'

import { Button, ButtonProps, Tooltip } from 'antd'
import classNames from 'classnames'
import { css } from '@emotion/css'

type Props = {
  children?: React.ReactNode
  icon?: React.ReactNode
  tooltip?: string
  disabled?: boolean
  onClick?: any
} & ButtonProps

export const ButtonIcon: React.FC<Props> = ({ children, icon, tooltip, className, disabled, onClick, ...props }) => {
  const classNameBtn = css({
    '> *': {
      color: disabled ? '#9b9b9b' : 'inherit',
    },
  })
  return (
    <Tooltip title={tooltip}>
      <Button
        type="text"
        size="small"
        icon={icon}
        className={classNames(
          'flex items-center justify-center',
          disabled ? 'cursor-not-allowed bg-[#0000000a] border-[#d9d9d9] text-[#9b9b9b]' : '',
          className,
          classNameBtn
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
