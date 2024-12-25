import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Badge, Tooltip, Typography, message } from 'antd';
import { map } from 'lodash';
import dayjs from 'dayjs';
import { SendIcon, XIcon } from 'lucide-react';
import Scrollbars from 'react-custom-scrollbars-2';
import { formatDateChat } from '@/utils';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  participant: {
    id: string;
    name: string;
    user?: {
      image?: string;
    };
  };
}

interface ChatSectionProps {
  room: any;
  onClose: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ room, onClose }) => {
  const scrollRef = useRef<Scrollbars>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollToBottom();
  }, [messages]);

  const renderMessage = (msg: Message) => {
    return (
      <div key={msg.id} className="p-2">
        <div className="flex items-end">
          <Avatar className="mr-2" src={msg.participant.user?.image}>
            {msg.participant.name?.charAt(0)}
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-red-400">
                {msg.participant.name}
              </div>
              <Tooltip title={dayjs(msg.createdAt).format('DD/MM/YYYY hh:mm a')}>
                <div className="ml-2 text-[9px] text-gray-400">
                  {formatDateChat(msg.createdAt)}
                </div>
              </Tooltip>
            </div>

            <div className="text-sm text-gray-400 p-2 rounded-lg bg-gray-200 dark:bg-dark_ebony whitespace-pre-wrap w-fit">
              {msg.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 border-b dark:border-[#232C3C] flex items-center font-bold px-4 justify-between">
        <span className="dark:text-gray-200 text-gray-900">Chat</span>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          onClick={onClose}
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="flex-1">
        <Scrollbars ref={scrollRef} className="h-full dark:bg-[#1D2431] bg-white">
          {map(messages, renderMessage)}
        </Scrollbars>
      </div>

      <div className="h-16 border-t dark:border-t-[#232C3C] px-4 flex items-center">
        <input
          className="flex-1 px-4 py-2 bg-transparent border-0 text-gray-400 focus:outline-none"
          placeholder="Type a message..."
        />
        <button className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
          <SendIcon size={16} />
        </button>
      </div>
    </div>
  );
};