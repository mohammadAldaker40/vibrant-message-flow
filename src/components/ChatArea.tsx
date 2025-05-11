
import React, { useState, useRef, useEffect } from 'react';
import { Message, Conversation, User } from '../types';
import MessageItem from './MessageItem';
import Avatar from './Avatar';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Send, Image, Smile } from 'lucide-react';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type: 'text' | 'image', mediaUrl?: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (!conversation) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
            Select a conversation to start chatting
          </h3>
          <p className="text-gray-500 mt-2">
            Choose from your existing conversations or start a new one
          </p>
        </div>
      </div>
    );
  }
  
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  const displayName = conversation.isGroup 
    ? conversation.groupName 
    : otherParticipant?.username;
  const avatarSrc = conversation.isGroup 
    ? conversation.groupAvatar 
    : otherParticipant?.avatar;
  const isOnline = conversation.isGroup 
    ? true 
    : otherParticipant?.isOnline;
  
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center">
          <Avatar 
            src={avatarSrc || ''} 
            alt={displayName || ''} 
            status={isOnline ? 'online' : 'offline'} 
            size="md" 
          />
          <div className="ml-3">
            <h3 className="font-medium">{displayName}</h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
              {conversation.isGroup && ` · ${conversation.participants.length} members`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length > 0 ? (
          messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {conversation.typing && (
          <div className="flex mb-3">
            <div className="message-bubble received flex items-center justify-center">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
            <Smile size={20} />
          </button>
          
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-grow bg-transparent outline-none px-3 py-2 resize-none h-10 max-h-32 overflow-y-auto"
            rows={1}
          />
          
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
              <Paperclip size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
              <Image size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
              <Mic size={20} />
            </button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="rounded-full ml-1 p-2 h-10 w-10 flex items-center justify-center"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
