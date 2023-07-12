'use client'

import { ButtonProps, Input, Modal, Tag, Typography } from 'antd'
import { useCallback, useState } from 'react'
import { ButtonIcon } from '@/components'

type Props = {
    children?: React.ReactNode
    icon?: React.ReactNode
    tooltip?: string
    confirmText?: string
    onOk?: () => void
} & ButtonProps

export const ButtonConfirm: React.FC<Props> = ({ children, icon, tooltip, confirmText, onOk, ...props }) => {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState('')
    const onClick = useCallback(() => {
        if (content === confirmText) {
            onOk?.()
        }
        setOpen(false)
    }, [confirmText, content, onOk])

    return (
        <>
            <ButtonIcon
                icon={icon}
                onClick={() => {
                    setOpen(true)
                }}
                tooltip={tooltip}
                {...props}
            >
                {children}
            </ButtonIcon>
            <Modal title="Are you sure?" destroyOnClose open={open} onOk={onClick} onCancel={() => setOpen(false)}>
                <Typography.Paragraph className="mb-2">
                    Please type{' '}
                    <Tag color="error" className="mr-0">
                        {confirmText}
                    </Tag>{' '}
                    to confirm
                </Typography.Paragraph>
                <Input value={content} onChange={(e) => setContent(e.target.value)} />
            </Modal>
        </>
    )
}
