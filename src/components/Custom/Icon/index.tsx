'use client'

import classNames from 'classnames'

type Props = {
    icon?: React.ReactNode
    className?: string
}

export const Icon: React.FC<Props> = ({ icon, className }) => {
    return <div className={classNames('flex items-center justify-center', className)}>{icon}</div>
}
