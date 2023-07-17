'use client'

import { Typography } from 'antd'
import { CopyIcon } from 'lucide-react'
import { ButtonIcon, Copy } from '@/components'

type Props = {
    title?: string
    extra?: React.ReactNode
    content?: string | number | null
    className?: string
    showCopy?: boolean
}

export const CardCopy: React.FC<Props> = ({ className, title, extra, content, showCopy = true }) => {
    return (
        <div className={className}>
            <div className="mb-2 flex items-center justify-between">
                <Typography.Paragraph className="mb-0 font-semibold">{title}</Typography.Paragraph>
                {extra}
            </div>
            <div className="rounded-md py-2 px-3 border mb-4 bg-white h-[42px]">
                <div className="flex items-center justify-between">
                    <Typography.Paragraph ellipsis className="mb-0">
                        {content}
                    </Typography.Paragraph>
                    {showCopy && (
                        <Copy text={String(content) || ''}>
                            <ButtonIcon icon={<CopyIcon size={16} />} />
                        </Copy>
                    )}
                </div>
            </div>
        </div>
    )
}
