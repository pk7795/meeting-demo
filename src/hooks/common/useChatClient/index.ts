import { useEffect, useRef, useState } from 'react';
import { ErmisChat } from 'ermis-chat-js-sdk';
import type { LoginConfig, ErmisChatGenerics } from './types';
export const useChatClient = () => {
    const [chatClient, setChatClient] = useState<ErmisChat<ErmisChatGenerics> | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [unreadCount, setUnreadCount] = useState<number>();
    const unsubscribePushListenersRef = useRef<() => void>();
    // const { disconnect } = useDisconnect();
    /**
     * @param config the user login config
     * @returns function to unsubscribe from listeners
     */
    const loginUser = async (config: LoginConfig) => {
        let api_key = process.env.ERMIS_API_KEY || "VskVZNX0ouKF1751699014812";
        let project_id = "b44937e4-c0d4-4a73-847c-3730a923ce83";
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
        await client.connectToSSE();

        const initialUnreadCount = connectedUser?.me?.total_unread_count;
        setUnreadCount(initialUnreadCount);
        window.localStorage.setItem('@ermisChat-login-userId', config.userId);
        window.localStorage.setItem('@ermisChat-login-userToken', config.userToken);

        // get profile user
        let profile = await client.queryUser(config.userId);

        client._setUser(profile);
        client.state.updateUser(profile);

        // let chains = await client.getChains();
        // console.log('~~~~~~~~~~~~~~~~~~~~~~~~chains: ', chains);

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
                    await loginUser({ userId, userToken });
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

    useEffect(() => {
        const run = async () => {
            await switchUser();
        };
        run();
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
    };
};
