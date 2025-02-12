// contexts/ChatContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { Channel, ChannelData, ErmisChat } from 'ermis-chat-js-sdk';
import { ErmisChatGenerics, LoginConfig } from '@/hooks/common/useChatClient/types';
import { useChatClient } from '@/hooks/common/useChatClient';

interface ChatContextType {
    chatClient: ErmisChat<ErmisChatGenerics> | null;
    loginUser: (config: LoginConfig) => void;
    logout: () => void;
    switchUser: (config?: LoginConfig) => void;
    unreadCount: number | undefined;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useAppContext = () => useContext(ChatContext);

export function ChatProvider({ children, channelType, channelId, options }: { children: React.ReactNode; channelId: string; channelType: string, options: ChannelData<ErmisChatGenerics> }) {
    const { chatClient, loginUser, logout, switchUser, unreadCount } = useChatClient();
    useEffect(() => {

        if (chatClient) {
            chatClient.channel(channelType, channelId, options)
        }
    }
        , [chatClient, channelId]);
    return (
        <ChatContext.Provider value={{ chatClient, loginUser, logout, switchUser, unreadCount }}>
            {children}
        </ChatContext.Provider>
    );
}