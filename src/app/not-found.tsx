'use client'

import { Button, Result } from 'antd'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" href="/">
            Back Home
          </Button>
        }
      />
    </div>
  )
}
