'use client'

import { Button } from 'antd'
import { useDispatch } from 'react-redux'
import { setErrorChannel } from '@/redux/slices/channel'

const ChannelNotFound = () => {
    const dispatch = useDispatch()

    const onGoBack = () => {
        dispatch(setErrorChannel(false))
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full space-y-8">

            <div className="flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-semibold text-center">
                    CHANNEL NOT FOUND!
                </h2>

                <p className="text-lg text-center text-gray-500 dark:text-gray-400">
                    The link you accessed does not correspond to any existing chat channel.
                    <br />
                    Please check the URL or go back to the main page.
                </p>

                <div className="flex justify-center space-x-2">
                    <Button
                        type="primary"
                        onClick={onGoBack}
                        className="font-normal"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ChannelNotFound