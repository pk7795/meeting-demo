'use client'

import { Button, Result } from 'antd'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.log('--------------------------------------------------------')
    console.error('error', error)
    console.log('--------------------------------------------------------')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <Result
        status="500"
        title="500"
        subTitle="Sorry, something went wrong."
        extra={
          <Button type="primary" onClick={() => reset()}>
            Try again
          </Button>
        }
      />
    </div>
  )
}
