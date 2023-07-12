'use client'

import { Card } from 'antd'
import { CoffeeIcon } from 'lucide-react'

type Props = {
  children?: React.ReactNode
  condition?: boolean
}

export const CheckEmpty: React.FC<Props> = ({ children, condition }) => {
  return !condition ? (
    <Card>
      <div className="flex flex-col items-center justify-center text-gray_8">
        <CoffeeIcon size={16} />
        <div className="mb-0 mt-2">Empty data</div>
      </div>
    </Card>
  ) : (
    <>{children}</>
  )
}
