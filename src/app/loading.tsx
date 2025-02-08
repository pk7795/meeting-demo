'use client'

import * as Progress from '@radix-ui/react-progress'

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Progress.Root className="relative h-8 w-8 rotate-0 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500">
        <Progress.Indicator className="h-full w-full" />
      </Progress.Root>
    </div>
  )
}
