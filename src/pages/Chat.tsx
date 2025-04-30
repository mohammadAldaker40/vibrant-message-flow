
import React, { useState, useEffect } from 'react';
import ConversationList from '../components/ConversationList';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Avatar from '../components/Avatar';

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const { conversations, messages, sendMessage, startTyping, stopTyping } = useSocket();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  
  // Set the first conversation as active by default
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);
  
  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text', mediaUrl?: string) => {
    if (activeConversationId && user) {
      sendMessage(activeConversationId, content, type, mediaUrl);
      
      // Simulate typing in response
      setTimeout(() => {
        startTyping(activeConversationId);
      }, 500);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="w-full md:w-80 h-full flex flex-col">
        {/* User Profile */}
        <div className="p-4 bg-sidebar flex items-center justify-between">
          <div className="flex items-center">
            <Avatar src={user.avatar} alt={user.username} status="online" size="sm" />
            <h3 className="ml-2 font-medium text-white">{user.username}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout} 
            className="text-gray-300 hover:text-white hover:bg-slate-700"
          >
            <LogOut size={20} />
          </Button>
        </div>
        
        {/* Conversations */}
        <div className="flex-grow overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-grow h-full">
        <ChatArea
          conversation={activeConversation}
          messages={activeMessages}
          currentUser={user}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
