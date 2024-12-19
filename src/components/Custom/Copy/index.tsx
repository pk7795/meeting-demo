'use client'

import { useApp } from '../App'
import { Tooltip } from 'antd'
import CopyToClipboard from 'react-copy-to-clipboard'

type Props = {
  children?: React.ReactNode
  text?: string
  tooltip?: string
}
const CopyToClipboardAny = CopyToClipboard as any;
export const Copy: React.FC<Props> = ({ children, text = '' }) => {
  const { message } = useApp()
  return (
    <CopyToClipboardAny text={text} onCopy={() => message.info('Copied')}>
      <Tooltip title="Click to copy">
        <span className="cursor-pointer">{children}</span>
      </Tooltip>
    </CopyToClipboardAny>
  )
}
