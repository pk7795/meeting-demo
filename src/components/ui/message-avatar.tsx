import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatClientContext } from "@/contexts/chat";
import { formatDateChat } from "@/utils";
import dayjs from "dayjs";
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
  const userName = typeof user.name === 'string' ? user.name : '';
  const systemCode = message.text?.trim().split(' ')[0];
  switch (systemCode) {
    case "17":
      message.text = `${userName || user.id} joined the meeting`;
      break;

    default:
      break;
  }
  return (

    <div key={message.id} className="p-2">
      <div className="flex items-end">
        <Avatar className="h-10 w-10 rounded-full">
          <AvatarImage src={user?.image || user?.avatar} alt={userName} />
          <AvatarFallback className="rounded-full">{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 ml-1">
          <div className="flex items-center justify-between">
            <Tooltip>
              <div className="text-xs font-bold text-[#F87171]">{userName || formatUserName(user.id)}</div>
              <TooltipTrigger asChild>
                <div className="ml-2 text-[9px] text-gray-400">{formatDateChat(message.created_at)}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{dayjs(message.created_at).format('DD/MM/YYYY hh:mm a')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div
            className="text-sm text-gray-500 dark:text-gray-700 p-2 rounded-lg bg-gray-200  w-fit"
            dangerouslySetInnerHTML={{ __html: message.html || message.text || "" }}
          />
        </div>
      </div>
    </div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';