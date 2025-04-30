
import React from 'react';
import { Conversation } from '../types';
import Avatar from './Avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const { participants, lastMessage, unreadCount, isGroup, groupName, groupAvatar, typing } = conversation;
  
  // For individual chats, get the other participant (not the current user)
  const otherParticipant = participants.find(p => p.id !== 'user-1');
  
  const displayName = isGroup ? groupName : otherParticipant?.username;
  const avatarSrc = isGroup ? groupAvatar : otherParticipant?.avatar;
  const isOnline = isGroup ? true : otherParticipant?.isOnline;
  
  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
        isActive 
          ? "bg-primary/10 hover:bg-primary/15" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
    >
      <Avatar 
        src={avatarSrc || ''} 
        alt={displayName || ''} 
        status={isOnline ? 'online' : 'offline'}
        size="md"
      />
      
      <div className="ml-3 flex-grow min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm truncate">{displayName}</h3>
          {lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          {typing ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : lastMessage ? (
            <p className="text-xs text-gray-500 truncate max-w-[180px]">
              {lastMessage.type === 'image' ? '📷 Photo' : lastMessage.content}
            </p>
          ) : (
            <p className="text-xs text-gray-500">No messages yet</p>
          )}
          
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
