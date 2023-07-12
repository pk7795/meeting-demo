'use client'

import { Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function IndexNewMeeting() {
    const router = useRouter()

    useEffect(() => {
        // create a new meeting
        // get the code
        // redirect to /meeting/[code]
        router.push('/meeting/1234')
    }, [router])

    return (
        <div className="flex items-center justify-center w-full h-screen">
            <Spin spinning />
        </div>
    )
}
