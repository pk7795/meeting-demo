'use client'

import { Spin } from 'antd'

export default async function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Spin spinning />
    </div>
  )
}
