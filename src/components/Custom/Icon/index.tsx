'use client'

type Props = {
    icon?: React.ReactNode
}

export const Icon: React.FC<Props> = ({ icon }) => {
    return <div className="flex items-center justify-center">{icon}</div>
}
