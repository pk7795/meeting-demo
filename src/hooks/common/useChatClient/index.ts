'use client'
import { useEffect, useRef, useState } from 'react';
import { Channel, ErmisChat } from 'ermis-chat-js-sdk';
import type { LoginConfig, ErmisChatGenerics, RoomConfig } from './types';
import { getChatChannelByRoomId, createChatChannel } from '@/app/actions/chat/actions';

async function initializeChannel(client: ErmisChat<ErmisChatGenerics>, roomConfig: RoomConfig) {
    try {
        // Step 1: Check if channel exists
        const channelData = await getChatChannelByRoomId(roomConfig.meetingRoomId);

        // Step 2: Handle existing channel
        if (!channelData.isNew) {
            const chatChannel = client.channel(channelData.channelType!, channelData.channelId!);
            if (!roomConfig.isRoomOwner) {
                await chatChannel.acceptInvite('join');
            }
            await chatChannel.watch();
            const userIds: string[] = Object.keys(chatChannel.state.members);
            // update name from participants to users state
            const existingUserIds = userIds.filter((userId) => {
                if (userId === 'mockMember') {
                    return false;
                }
                return client.state.users[userId] === undefined;
            });
            if (existingUserIds.length > 0) {
                await client.getBatchUsers(existingUserIds);
            }
            return chatChannel;
        }

        // Step 3: Handle new channel
        if (!roomConfig.isRoomOwner) {
            console.error('Only room owner can create new channel');
            throw new Error('Only room owner can create new channel');
        }

        // Step 4: Create new channel
        const newChannelData = {
            name: roomConfig.roomName,
            members: [roomConfig.userId, "mockMember"],
            public: true,
        };

        const newChannel = client.channel('team', newChannelData);
        await newChannel.watch();

        // Step 5: Save to DB
        await createChatChannel(
            roomConfig.meetingRoomId,
            newChannel.id!,
            'team'
        );

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
        const apiKey = process.env.ERMIS_CHAT_API_KEY || "VskVZNX0ouKF1751699014812";
        const projectId = config.projectId;
        // unsubscribe from previous push listeners
        unsubscribePushListenersRef.current?.();
        const client = ErmisChat.getInstance<ErmisChatGenerics>(apiKey, projectId, {
            timeout: 6000,
            logger: (type, msg) => console.log(type, msg),
            baseURL: process.env.ERMIS_CHAT_API || 'https://api-stagging.ermis.network',
        });

        setChatClient(client);
        const user = {
            id: config.userId,
            api_key: apiKey,
        };

        const connectedUser = await client.connectUser(user, config.userToken).then((res) => res).catch((e) => {
            console.error("Error", "Please check your internet connection and try again");
            return null;
        });

        // connect to SSE, which will keep the connection alive and listen to new messages from user servers.
        await client.connectToSSE();
        await client.queryUser(config.userId);


        const initialUnreadCount = connectedUser?.me?.total_unread_count;
        setUnreadCount(initialUnreadCount);
        // window.localStorage.setItem('@ermisChat-login-userId', config.userId);
        // window.localStorage.setItem('@ermisChat-login-userToken', config.userToken);

        setChatClient(client);
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
        chatClient?.disconnectFromSSE();
        window.localStorage.clear();
    };

    const joinChatChannel = async (roomConfig: RoomConfig) => {
        if (chatClient) {
            try {
                const channel = await initializeChannel(chatClient, roomConfig);

                setChannel(channel);
            } catch (error) {
                console.error('Error: ', error);
            }
        }
    }
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
        joinChatChannel
    };
};
