
export type LocalAttachmentType = {
    file_size?: number;
    mime_type?: string;
};
export type LocalChannelType = Record<string, unknown>;
export type LocalCommandType = string;
export type LocalEventType = Record<string, unknown>;
export type LocalMessageType = Record<string, unknown>;
export type LocalReactionType = Record<string, unknown>;
export type LocalUserType = {
    image?: string;
};
type LocalPollOptionType = Record<string, unknown>;
type LocalPollType = Record<string, unknown>;

export type ErmisChatGenerics = {
    attachmentType: LocalAttachmentType;
    channelType: LocalChannelType;
    commandType: LocalCommandType;
    eventType: LocalEventType;
    messageType: LocalMessageType;
    pollOptionType: LocalPollOptionType;
    pollType: LocalPollType;
    reactionType: LocalReactionType;
    userType: LocalUserType;
};

export type LoginConfig = {
    userId: string;
    userToken: string;
    userImage?: string;
    userName?: string;
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