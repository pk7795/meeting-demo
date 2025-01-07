import { useChatClientContext } from "@/contexts/chat";
import { ErmisChatGenerics } from "@/hooks/common/useChatClient/types";
import { formatDateChat } from "@/utils";
import { Avatar, Tooltip } from "antd";
import dayjs from "dayjs";
import { ErmisChat } from "ermis-chat-js-sdk/dist/types/client";
import { FormatMessageResponse } from "ermis-chat-js-sdk/dist/types/types";
import React, { useMemo } from "react";

interface MessageAvatarProps {
  message: FormatMessageResponse;
}
const formatUserName = (name: string) => {
  return name.slice(0, 18) + '...';
};

export const MessageAvatar = React.memo(({ message }: MessageAvatarProps) => {
  const client = useChatClientContext();

  const user = useMemo(() => {
    if (!client || !message?.user?.id) return message.user;
    return client.state.users[message.user.id] || message.user;
  }, [client?.state.users, message.user]);

  if (!user) return null;
  const systemCode = message.text?.trim().split(' ')[0];
  switch (systemCode) {
    case "17":
      message.text = `${user?.name || user.id} joined the meeting`;
      break;

    default:
      break;
  }
  return (

    <div key={message.id} className="p-2">
      <div className="flex items-end">
        <Avatar
          className="mr-2"
          src={user.avatar}
          alt={user.name || user.id}
        >
          {user.name?.[0] || user.id?.[0]}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#F87171]">{user.name || formatUserName(user.id)}</div>
            <Tooltip title={dayjs(message.created_at).format('DD/MM/YYYY hh:mm a')}>
              <div className="ml-2 text-[9px] text-gray-400">{formatDateChat(message.created_at)}</div>
            </Tooltip>
          </div>
          <div
            className="text-sm text-gray-400 p-2 rounded-lg bg-gray-200 dark:bg-dark_ebony whitespace-pre-wrap w-fit"
            dangerouslySetInnerHTML={{ __html: message.html || message.text || "" }}
          />
        </div>
      </div>
    </div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';