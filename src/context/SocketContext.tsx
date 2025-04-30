
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message, Conversation, User } from '../types';

interface SocketContextProps {
  sendMessage: (conversationId: string, content: string, type: 'text' | 'image', mediaUrl?: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  initialConversations: Conversation[];
  initialMessages: Record<string, Message[]>;
  currentUser: User;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  initialConversations,
  initialMessages,
  currentUser,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [typingTimeouts, setTypingTimeouts] = useState<Record<string, NodeJS.Timeout>>({});
  
  // Mock socket connection
  useEffect(() => {
    // In a real app, we'd connect to a socket server
    console.log('Socket connected');
    
    return () => {
      // In a real app, we'd disconnect from the socket server
      console.log('Socket disconnected');
    };
  }, []);
  
  // Send a message
  const sendMessage = (
    conversationId: string, 
    content: string, 
    type: 'text' | 'image', 
    mediaUrl?: string
  ) => {
    // Create a new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
      isRead: false,
      type,
      mediaUrl,
    };
    
    // In a real app, we'd send this message via socket
    
    // Update local state
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));
    
    // Update conversation with last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage, unreadCount: 0 } 
          : conv
      )
    );
    
    // Simulate a response after a delay (for demo purposes)
    if (type === 'text') {
      setTimeout(() => {
        const responder = conversations
          .find(c => c.id === conversationId)
          ?.participants.find(p => p.id !== currentUser.id);
        
        if (responder) {
          // Start typing indicator
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId ? { ...conv, typing: true } : conv
            )
          );
          
          // Send response after a delay
          setTimeout(() => {
            const responseMessage: Message = {
              id: `msg-${Date.now()}`,
              senderId: responder.id,
              content: `Thanks for your message: "${content.slice(0, 20)}${content.length > 20 ? '...' : ''}"`,
              timestamp: Date.now(),
              isRead: true,
              type: 'text',
            };
            
            // Update messages
            setMessages(prev => ({
              ...prev,
              [conversationId]: [...(prev[conversationId] || []), responseMessage],
            }));
            
            // Update conversation with last message
            setConversations(prev => 
              prev.map(conv => 
                conv.id === conversationId 
                  ? { 
                      ...conv, 
                      lastMessage: responseMessage, 
                      typing: false,
                      unreadCount: conv.unreadCount + 1 
                    } 
                  : conv
              )
            );
          }, 2000);
        }
      }, 1000);
    }
  };
  
  // Start typing indicator
  const startTyping = (conversationId: string) => {
    if (typingTimeouts[conversationId]) {
      clearTimeout(typingTimeouts[conversationId]);
    }
    
    // In a real app, we'd emit a "typing" event to the socket
    
    // Update local state to reflect typing
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, typing: true } : conv
      )
    );
    
    // Automatically stop typing after 3 seconds
    const timeout = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
    
    setTypingTimeouts(prev => ({
      ...prev,
      [conversationId]: timeout,
    }));
  };
  
  // Stop typing indicator
  const stopTyping = (conversationId: string) => {
    if (typingTimeouts[conversationId]) {
      clearTimeout(typingTimeouts[conversationId]);
    }
    
    // In a real app, we'd emit a "stop typing" event to the socket
    
    // Update local state to reflect stopped typing
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, typing: false } : conv
      )
    );
    
    const newTypingTimeouts = { ...typingTimeouts };
    delete newTypingTimeouts[conversationId];
    setTypingTimeouts(newTypingTimeouts);
  };
  
  return (
    <SocketContext.Provider value={{ 
      sendMessage, 
      startTyping, 
      stopTyping,
      conversations,
      messages,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
