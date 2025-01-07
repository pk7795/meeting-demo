import { useChatClient } from "@/hooks/common/useChatClient";
import { ErmisChatGenerics, LoginConfig, RoomConfig } from "@/hooks/common/useChatClient/types";
import { RoomAccessStatus } from "@/lib/constants";
import { RoomPopulated } from "@/types/types";
import { RoomParticipant } from "@prisma/client";
import { Channel } from "ermis-chat-js-sdk/dist/types/channel";
import { ErmisChat } from "ermis-chat-js-sdk/dist/types/client";
import { FormatMessageResponse } from "ermis-chat-js-sdk/dist/types/types";
import { useSession } from "next-auth/react";
import { createContext, use, useContext, useEffect, useState } from "react";

export const ChatContext = createContext<{
    chatClient: ErmisChat<ErmisChatGenerics> | null;
    logout: () => void;
    switchUser: (config?: LoginConfig) => void;
    channel: Channel<ErmisChatGenerics> | null;
    messages: FormatMessageResponse[];
    setRoomAccessStatus: React.Dispatch<React.SetStateAction<RoomAccessStatus | null>>;
}>({} as any);

export const ChatContextProvider = ({
    children,
    room,
    roomParticipant
}: {
    children: React.ReactNode
    room: RoomPopulated | null
    roomParticipant: RoomParticipant | null
}) => {
    const { chatClient, loginUser, logout, switchUser, channel, joinChatChannel } = useChatClient();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<FormatMessageResponse[]>([]);
    const [roomAccessStatus, setRoomAccessStatus] = useState<RoomAccessStatus | null>(RoomAccessStatus.PENDING);
    useEffect(() => {
        if (!session) return;
        if (!chatClient) {
            let loginConfig = {
                userId: session.chat.userId,
                userToken: session.chat.accessToken,
                projectId: session.chat.projectId,
            }
            loginUser(loginConfig);
            console.log("-----------------connect chat websocket ------------------");
        }

        if (roomAccessStatus === RoomAccessStatus.JOINED && roomParticipant && room) {
            let roomConfig: RoomConfig = {
                userId: session.chat.userId,
                meetingRoomId: roomParticipant.roomId,
                roomName: room.name,
                isRoomOwner: room!.ownerId === session.user.id,
            }
            joinChatChannel(roomConfig);
        }
    }, [session, chatClient, roomParticipant, room, roomAccessStatus]);

    useEffect(() => {
        if (!channel) return;
        setMessages(channel.state.messages);

        // because something wrong with member.added event and don't have event for member added, so we need to check members by message.new event for all members of channel except new member.
        // for new member, we check by get members list from channel state.
        // const channelSubscriptions: Array<ReturnType<Channel['on']>> = [];
        const handleNewMessage = (event: any) => {

            if (event.message.type === 'system') {
                const systemCode = event.message.text.trim().split(' ')[0];
                switch (systemCode) {
                    case "17":
                        const user = chatClient?.state.users[event.user.id];

                        if (!user) {
                            chatClient?.queryUser(event.user.id);
                        }
                        event.message.text = `${user?.name || event.user.id} joined the meeting`;
                        break;

                    default:
                        break;
                }
            }
            setMessages((prev) => [...prev, event.message]);

        };
        // const handleMemberAdded = (event: any) => {
        //     const user = chatClient?.state.users[event.user.id];
        //     if (!user) {
        //         chatClient?.queryUser(event.user.id);
        //     }
        // }
        // channelSubscriptions.push(channel.on('message.new', handleNewMessage));
        // channelSubscriptions.push(channel.on('member.added', handleMemberAdded));

        // return () => {
        //     channelSubscriptions.forEach((s) => s.unsubscribe());
        // };
        const listener = channel.on('message.new', handleNewMessage);

        return () => {
            listener.unsubscribe();
        };
    }, [channel]);
    return <ChatContext.Provider
        value={{
            chatClient,
            logout,
            switchUser,
            channel,
            messages,
            setRoomAccessStatus
        }}>
        {children}
    </ChatContext.Provider>;
}
export const useChatContext = () => {
    const context = useContext(ChatContext)
    return context
}

export const useChatClientContext = () => {
    const context = useChatContext()
    return context.chatClient
}
export const useChatChannelContext = () => {
    const context = useChatContext()
    return context.channel
}
export const useChatMessages = () => {
    const context = useChatContext()
    return context.messages
}
export const useChatPendingMeetingRoomStatusContext = () => {
    const context = useChatContext()
    return context.setRoomAccessStatus
}