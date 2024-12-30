'use client'
import { useEffect, useRef, useState } from 'react';
import { Channel, ErmisChat } from 'ermis-chat-js-sdk';
import type { LoginConfig, ErmisChatGenerics } from './types';
import { getChatChannelByRoomId, createChatChannel } from '@/app/actions/chat/actions';

async function initializeChannel(client: ErmisChat<ErmisChatGenerics>, config: LoginConfig) {
    try {
        // Step 1: Check if channel exists
        const channelData = await getChatChannelByRoomId(config.meetingRoomId);

        // Step 2: Handle existing channel
        if (!channelData.isNew) {
            const chatChannel = client.channel(channelData.channelType!, channelData.channelId!);
            await chatChannel.query({ messages: { limit: 25 } });
            return chatChannel;
        }

        // Step 3: Handle new channel
        if (!config.isRoomOwner) {
            console.error('Only room owner can create new channel');
            throw new Error('Only room owner can create new channel');
        }

        // Step 4: Create new channel
        const newChannelData = {
            name: config.roomName,
            members: [config.userId, "mockMember"],
            public: true,
        };

        const newChannel = client.channel('team', newChannelData);
        await newChannel.create();

        // Step 5: Save to DB
        createChatChannel(
            config.meetingRoomId,
            newChannel.id!,
            'team'
        ).then((res) => {
            console.log('createChatChannel: ', res);
        }).catch(e => {
            console.error('Error: ', e);
        });

        return newChannel;

    } catch (error) {
        console.error('Channel initialization failed:', error);
        throw error;
    }
}
export const useChatClient = () => {
    const [chatClient, setChatClient] = useState<ErmisChat<ErmisChatGenerics> | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [unreadCount, setUnreadCount] = useState<number>();
    const unsubscribePushListenersRef = useRef<() => void>();
    const [channel, setChannel] = useState<Channel<ErmisChatGenerics> | null>(null);
    // const { disconnect } = useDisconnect();
    /**
     * @param config the user login config
     * @returns function to unsubscribe from listeners
     */
    const loginUser = async (config: LoginConfig) => {
        let api_key = process.env.ERMIS_API_KEY || "VskVZNX0ouKF1751699014812";
        let project_id = config.projectId;
        // unsubscribe from previous push listeners
        unsubscribePushListenersRef.current?.();
        const client = ErmisChat.getInstance<ErmisChatGenerics>(api_key, project_id, {
            timeout: 6000,
            logger: (type, msg) => console.log(type, msg),
            baseURL: process.env.ERMIS_API || 'https://api-stagging.ermis.network',
        });
        console.log('api url: ', process.env.ERMIS_API, "   api key: ", process.env.ERMIS_API_KEY)

        setChatClient(client);
        const user = {
            id: config.userId,
            api_key: api_key,
        };

        const connectedUser = await client.connectUser(user, config.userToken).then((res) => res).catch((e) => {
            console.error("Error", "Please check your internet connection and try again");
            return null;
        });

        // connect to SSE, which will keep the connection alive and listen to new messages from user servers.
        // await client.connectToSSE();

        const initialUnreadCount = connectedUser?.me?.total_unread_count;
        setUnreadCount(initialUnreadCount);
        // window.localStorage.setItem('@ermisChat-login-userId', config.userId);
        // window.localStorage.setItem('@ermisChat-login-userToken', config.userToken);

        setChatClient(client);
        if (client) {
            try {
                const channel = await initializeChannel(client, config);
                setChannel(channel);
            } catch (error) {
                console.error('Error: ', error);
            }
        }
    };

    const switchUser = async (config?: LoginConfig) => {
        setIsConnecting(true);
        try {
            if (config) {
                await loginUser(config);
            } else {
                const userId = window.localStorage.getItem('@ermisChat-login-userId');
                const userToken = window.localStorage.getItem('@ermisChat-login-userToken');
                if (userId && userToken) {
                    // await loginUser({ userId, userToken });
                }
            }
        } catch (e) {
            console.warn("error : ", e);
        }

        setIsConnecting(false);
    };

    const logout = async () => {
        setChatClient(null);
        chatClient?.disconnectUser();
        // chatClient?.disconnectFromSSE();
        window.localStorage.clear();
    };

    useEffect(() => {
        // const run = async () => {
        //     await switchUser();
        // };
        // run();
        return unsubscribePushListenersRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Listen to changes in unread counts and update the badge count
     */
    useEffect(() => {
        const listener = chatClient?.on((e) => {
            if (e.total_unread_count !== undefined) {
                setUnreadCount(e.total_unread_count);
            } else {
                const countUnread = Object.values(chatClient.activeChannels).reduce(
                    (count, channel) => count + channel.countUnread(),
                    0,
                );
                setUnreadCount(countUnread);
            }
        });

        return () => {
            if (listener) {
                listener.unsubscribe();
            }
        };
    }, [chatClient]);

    return {
        chatClient,
        isConnecting,
        loginUser,
        logout,
        switchUser,
        unreadCount,
        channel,
    };
};
