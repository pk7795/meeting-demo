'use client'

import { useApp } from '../App'
import { Tooltip } from 'antd'
import CopyToClipboard from 'react-copy-to-clipboard'

type Props = {
  children?: React.ReactNode
  text?: string
  tooltip?: string
}

export const Copy: React.FC<Props> = ({ children, text = '' }) => {
  const { message } = useApp()
  return (
    <CopyToClipboard text={text} onCopy={() => message.info('Copied')}>
      <Tooltip title="Click to copy">{children}</Tooltip>
    </CopyToClipboard>
  )
}
