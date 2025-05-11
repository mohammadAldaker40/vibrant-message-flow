
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message, Conversation, User } from '../types';
import { database } from '../config/firebase';
import { 
  ref, 
  set, 
  push, 
  onValue, 
  update,
  get,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { toast } from "@/hooks/use-toast";

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
  const [dbConnected, setDbConnected] = useState(false);
  
  // Connect to Firebase and listen for changes
  useEffect(() => {
    console.log('Socket connected');
    
    // Check Firebase connection
    const connectedRef = ref(database, '.info/connected');
    const unsubscribeConnection = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setDbConnected(true);
        console.log('Firebase Realtime Database connected');
      } else {
        setDbConnected(false);
        console.log('Firebase connection lost or initializing');
      }
    });
    
    // Load conversations from Firebase
    const loadConversations = async () => {
      try {
        const conversationsRef = ref(database, 'conversations');
        const unsubscribeConversations = onValue(conversationsRef, (snapshot) => {
          if (snapshot.exists()) {
            const conversationList: Conversation[] = [];
            snapshot.forEach((childSnapshot) => {
              const conversation = childSnapshot.val();
              // Only include conversations where the current user is a participant
              if (conversation.participants.some((p: User) => p.id === currentUser.id)) {
                conversationList.push(conversation);
              }
            });
            
            if (conversationList.length > 0) {
              setConversations(conversationList);
            } else {
              // If no conversations are found, load approved users and create conversations
              loadApprovedUsers();
            }
          } else {
            // If no conversations exist in Firebase, load from approved users
            loadApprovedUsers();
          }
        });
        
        return () => {
          unsubscribeConversations();
        };
      } catch (error) {
        console.error('Error loading conversations from Firebase:', error);
        // Fallback to loading approved users
        loadApprovedUsers();
      }
    };
    
    // Load approved users and create conversations if needed
    const loadApprovedUsers = () => {
      const storedRegistrations = localStorage.getItem('pendingRegistrations');
      if (storedRegistrations) {
        try {
          const rawRegistrations = JSON.parse(storedRegistrations);
          
          // Filter only approved users
          const approvedUsers = rawRegistrations
            .filter((reg: any) => reg.status === 'approved')
            .map((reg: any) => ({
              id: reg.id,
              username: reg.username,
              avatar: `https://i.pravatar.cc/150?u=${reg.username}`,
              isOnline: false,
              isApproved: true
            }));
          
          // Create conversations for each approved user
          if (approvedUsers.length > 0) {
            const newConversations = approvedUsers.map((user: User) => {
              const conversation = {
                id: `conversation-${user.id}`,
                participants: [currentUser, user],
                unreadCount: 0,
                isGroup: false,
                typing: false
              };
              
              // Save conversation to Firebase
              if (dbConnected) {
                set(ref(database, `conversations/${conversation.id}`), conversation)
                  .catch(err => console.error('Error saving conversation to Firebase:', err));
              }
              
              return conversation;
            });
            
            setConversations(newConversations);
          }
        } catch (error) {
          console.error('Error loading approved users:', error);
        }
      }
    };
    
    loadConversations();
    
    return () => {
      // Cleanup subscriptions
      unsubscribeConnection();
      console.log('Socket disconnected');
    };
  }, [currentUser]);
  
  // Load messages for active conversation
  useEffect(() => {
    if (!dbConnected || conversations.length === 0) return;
    
    // Create a listener for each conversation's messages
    const messageListeners = conversations.map(conversation => {
      const conversationId = conversation.id;
      const messagesRef = ref(database, `messages/${conversationId}`);
      
      return onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messageList: Message[] = [];
          snapshot.forEach((childSnapshot) => {
            messageList.push(childSnapshot.val());
          });
          
          // Sort messages by timestamp
          messageList.sort((a, b) => a.timestamp - b.timestamp);
          
          // Update messages state
          setMessages(prev => ({
            ...prev,
            [conversationId]: messageList
          }));
        }
      });
    });
    
    // Cleanup function to unsubscribe from all listeners
    return () => {
      messageListeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [conversations, dbConnected]);
  
  // Send a message
  const sendMessage = async (
    conversationId: string, 
    content: string, 
    type: 'text' | 'image', 
    mediaUrl?: string
  ) => {
    if (!conversationId || !content) return;
    
    try {
      // Create a new message
      const newMessageRef = push(ref(database, `messages/${conversationId}`));
      const messageId = newMessageRef.key || `msg-${Date.now()}`;
      
      const newMessage: Message = {
        id: messageId,
        senderId: currentUser.id,
        content,
        timestamp: Date.now(),
        isRead: false,
        type,
        mediaUrl,
        conversationId: conversationId
      };
      
      // Save message to Firebase
      await set(ref(database, `messages/${conversationId}/${messageId}`), newMessage);
      
      // Update conversation with last message
      const conversationRef = ref(database, `conversations/${conversationId}`);
      const conversationSnapshot = await get(conversationRef);
      
      if (conversationSnapshot.exists()) {
        const conversation = conversationSnapshot.val();
        
        await update(conversationRef, {
          lastMessage: newMessage
        });
        
        // Simulate a response after a delay (for demo purposes)
        if (type === 'text') {
          setTimeout(() => {
            const responder = conversation.participants.find((p: User) => p.id !== currentUser.id);
            
            if (responder) {
              // Start typing indicator
              startTyping(conversationId);
              
              // Send response after a delay
              setTimeout(async () => {
                const responseMessageRef = push(ref(database, `messages/${conversationId}`));
                const responseMessageId = responseMessageRef.key || `msg-${Date.now()}`;
                
                const responseMessage: Message = {
                  id: responseMessageId,
                  senderId: responder.id,
                  content: `Thanks for your message: "${content.slice(0, 20)}${content.length > 20 ? '...' : ''}"`,
                  timestamp: Date.now(),
                  isRead: true,
                  type: 'text',
                  conversationId: conversationId
                };
                
                // Save response to Firebase
                await set(ref(database, `messages/${conversationId}/${responseMessageId}`), responseMessage);
                
                // Update conversation with last message and increment unread count
                await update(conversationRef, {
                  lastMessage: responseMessage,
                  typing: false,
                  unreadCount: conversation.unreadCount + 1
                });
              }, 2000);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Could not send your message. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Start typing indicator
  const startTyping = async (conversationId: string) => {
    if (typingTimeouts[conversationId]) {
      clearTimeout(typingTimeouts[conversationId]);
    }
    
    try {
      // Update conversation typing status in Firebase
      const conversationRef = ref(database, `conversations/${conversationId}`);
      await update(conversationRef, { typing: true });
      
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
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };
  
  // Stop typing indicator
  const stopTyping = async (conversationId: string) => {
    if (typingTimeouts[conversationId]) {
      clearTimeout(typingTimeouts[conversationId]);
    }
    
    try {
      // Update conversation typing status in Firebase
      const conversationRef = ref(database, `conversations/${conversationId}`);
      await update(conversationRef, { typing: false });
      
      // Update local state to reflect stopped typing
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, typing: false } : conv
        )
      );
      
      const newTypingTimeouts = { ...typingTimeouts };
      delete newTypingTimeouts[conversationId];
      setTypingTimeouts(newTypingTimeouts);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
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
