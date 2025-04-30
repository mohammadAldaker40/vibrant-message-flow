
import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser }) => {
  const { content, timestamp, type, mediaUrl, isRead } = message;
  
  return (
    <div 
      className={cn(
        "flex mb-3",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div className="flex flex-col">
        <div 
          className={cn(
            "message-bubble", 
            isCurrentUser ? "sent" : "received"
          )}
        >
          {type === 'text' && <p>{content}</p>}
          {type === 'image' && (
            <div className="mb-2">
              <img 
                src={mediaUrl} 
                alt="Shared image" 
                className="rounded-lg max-w-[240px] max-h-[240px] object-cover" 
              />
              {content && <p className="mt-2">{content}</p>}
            </div>
          )}
        </div>
        
        <div 
          className={cn(
            "text-xs mt-1 flex items-center",
            isCurrentUser ? "justify-end" : "justify-start",
            "text-gray-500"
          )}
        >
          {format(new Date(timestamp), 'h:mm a')}
          {isCurrentUser && (
            <span className="ml-1">
              {isRead ? (
                <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current text-blue-500">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current text-gray-400">
                  <path d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"></path>
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
