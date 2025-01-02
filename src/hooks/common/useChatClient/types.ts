import type { LiteralStringForUnion } from 'ermis-chat-js-sdk';

export type AttachmentType = {};
export type ChannelType = { demo?: string };
export type CommandType = LiteralStringForUnion;
export type EventType = {};
export type MessageType = {};
export type ReactionType = {};
export type UserType = { image?: string };

export type ErmisChatGenerics = {
    attachmentType: AttachmentType;
    channelType: ChannelType;
    commandType: CommandType;
    eventType: EventType;
    messageType: MessageType;
    reactionType: ReactionType;
    userType: UserType;
    pollOptionType: Record<string, unknown>;
    pollType: Record<string, unknown>;
};


export type LoginConfig = {
    userId: string;
    userToken: string;
    meetingRoomId: string;
    roomName: string;
    projectId: string;
    userImage?: string;
    userName?: string;
    isRoomOwner: boolean;
};
export const ActionType = {
    LEAVE: 'leave',
    DELETE: 'delete',
    REMOVE_MEMBER: 'remove_member',
    REMOVE_MODER: 'remove_moder',
    TRUNCATE: 'truncate', // tất cả tin nhắn trong cuộc trò chuyện sẽ bị xoá, chỉ sử dụng cho channel direct
    BLOCK: 'block',
    UNBLOCK: 'unblock',
}
export type ChatUser = {
    userId: string | null;
    gUserId: string;
}