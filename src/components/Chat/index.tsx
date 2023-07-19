'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Channel, ChannelList, SendBirdProvider, sendbirdSelectors } from '@sendbird/uikit-react'
import '@sendbird/uikit-react/dist/index.css'
import useSendbirdStateContext from '@sendbird/uikit-react/useSendbirdStateContext'

const ChannelWapper = () => {
    const params = useParams()
    const globalStore = useSendbirdStateContext()
    const sdkInstance = sendbirdSelectors.getSdk(globalStore)
    const createChannel = sendbirdSelectors.getCreateGroupChannel(globalStore)
    const leaveChannel = sendbirdSelectors.getLeaveGroupChannel(globalStore)
    const [channelUrl, setChannelUrl] = useState('')

    useEffect(() => {
        if (params?.passcode) {
            //
        }

        return () => {
            leaveChannel(channelUrl)
        }
    }, [channelUrl, createChannel, leaveChannel, params?.passcode])
    return <Channel channelUrl={channelUrl} renderChannelHeader={() => <></>} />
}

export default function Chat() {
    return (
        <>
            <SendBirdProvider
                appId="DF85682B-94D3-4296-9F5B-C75980C2FC23"
                accessToken="5a56b4606c70744b601fac161d43c2486e481831"
                userId="test-user-id"
                theme="dark"
            >
                <ChannelWapper />
            </SendBirdProvider>
        </>
    )
}
