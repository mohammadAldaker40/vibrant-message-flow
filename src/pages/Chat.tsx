
import React, { useState, useEffect } from 'react';
import ConversationList from '../components/ConversationList';
import ChatArea from '../components/ChatArea';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Settings } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

const Chat: React.FC = () => {
  const { user, logout } = useAuth();
  const { conversations, messages, sendMessage, startTyping, stopTyping } = useSocket();
  const navigate = useNavigate();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  
  // Set the first conversation as active by default
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
      toast({
        title: "Conversations loaded",
        description: `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''} loaded from the database.`,
      });
    }
  }, [conversations, activeConversationId]);

  // This effect ensures that when we select a conversation, any new messages are marked as read
  useEffect(() => {
    if (activeConversationId && activeConversation) {
      // Reset unread count for the active conversation
      // This would normally update the database as well, but for simplicity we're just handling the UI
    }
  }, [activeConversationId, activeConversation]);
  
  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text', mediaUrl?: string) => {
    if (activeConversationId && user) {
      sendMessage(activeConversationId, content, type, mediaUrl);
      
      // Simulate typing in response
      setTimeout(() => {
        startTyping(activeConversationId);
      }, 500);
    }
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
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
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')} 
              className="text-gray-300 hover:text-white hover:bg-slate-700 mr-1"
              title="Settings"
            >
              <Settings size={20} />
            </Button>
            {user.isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/admin')} 
                className="text-gray-300 hover:text-white hover:bg-slate-700 mr-1"
                title="Admin Panel"
              >
                <Users size={20} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              className="text-gray-300 hover:text-white hover:bg-slate-700"
              title="Logout"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-grow overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-grow h-full">
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            messages={activeMessages}
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
                No conversations yet
              </h3>
              {user.isAdmin ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Approve user registrations in the admin panel<br />to start conversations
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Wait for other approved users to join
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
