'use client'

import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Spin spinning />
    </div>
  )
}
