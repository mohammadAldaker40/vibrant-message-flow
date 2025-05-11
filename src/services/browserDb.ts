
import { User, Message, Conversation, UserSettings } from '../types';
import { database } from '../config/firebase';
import { 
  ref, 
  set, 
  get, 
  push, 
  child, 
  update, 
  query, 
  orderByChild, 
  equalTo 
} from 'firebase/database';

// Firebase Realtime Database service with localStorage fallback
class BrowserDb {
  private initialized: boolean = false;

  // Initialize the database
  async initialize(): Promise<boolean> {
    try {
      if (!this.initialized) {
        this.initialized = true;
        console.log('Firebase Realtime Database initialized');
        return true;
      }
      return this.initialized;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }
  
  // User operations
  async saveUser(user: User): Promise<User | null> {
    try {
      await this.initialize();
      
      // Save user to Firebase
      await set(ref(database, `users/${user.id}`), user);
      return user;
    } catch (error) {
      console.error('Error saving user to Firebase:', error);
      
      // Fallback to localStorage
      try {
        const usersJson = localStorage.getItem('users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex >= 0) {
          users[userIndex] = user;
        } else {
          users.push(user);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        return user;
      } catch (localError) {
        console.error('Error saving to localStorage fallback:', localError);
        return null;
      }
    }
  }
  
  async getUser(userId: string): Promise<User | null> {
    try {
      await this.initialize();
      
      // Get user from Firebase
      const snapshot = await get(ref(database, `users/${userId}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user from Firebase:', error);
      
      // Fallback to localStorage
      try {
        const usersJson = localStorage.getItem('users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const user = users.find(u => u.id === userId);
        return user || null;
      } catch (localError) {
        console.error('Error getting user from localStorage fallback:', localError);
        return null;
      }
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      await this.initialize();
      
      // Get all users from Firebase
      const snapshot = await get(ref(database, 'users'));
      if (snapshot.exists()) {
        const users: User[] = [];
        snapshot.forEach((childSnapshot) => {
          users.push(childSnapshot.val());
        });
        return users;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting all users from Firebase:', error);
      
      // Fallback to localStorage
      try {
        const usersJson = localStorage.getItem('users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        return users;
      } catch (localError) {
        console.error('Error getting users from localStorage fallback:', localError);
        return [];
      }
    }
  }
  
  // User settings operations
  async updateUserSettings(userId: string, settings: UserSettings): Promise<boolean> {
    try {
      await this.initialize();
      
      // Update user settings in Firebase
      await update(ref(database, `users/${userId}`), { settings });
      return true;
    } catch (error) {
      console.error('Error updating user settings in Firebase:', error);
      
      // Fallback to localStorage
      try {
        const usersJson = localStorage.getItem('users');
        const users: User[] = usersJson ? JSON.parse(usersJson) : [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
          users[userIndex].settings = settings;
          localStorage.setItem('users', JSON.stringify(users));
          return true;
        }
        
        return false;
      } catch (localError) {
        console.error('Error updating settings in localStorage fallback:', localError);
        return false;
      }
    }
  }
  
  // Message operations
  async saveMessage(message: Message): Promise<Message | null> {
    try {
      await this.initialize();
      
      // Generate a unique key for the message if not provided
      if (!message.id) {
        const newMsgRef = push(ref(database, 'messages'));
        message.id = newMsgRef.key || `msg-${Date.now()}`;
      }
      
      // Save message to Firebase
      await set(ref(database, `messages/${message.id}`), message);
      return message;
    } catch (error) {
      console.error('Error saving message to Firebase:', error);
      
      // Fallback to localStorage
      try {
        const messagesJson = localStorage.getItem('messages');
        const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        return message;
      } catch (localError) {
        console.error('Error saving message to localStorage fallback:', localError);
        return null;
      }
    }
  }
  
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    try {
      await this.initialize();
      
      // Query messages by conversation ID
      const messagesRef = ref(database, 'messages');
      const messagesQuery = query(messagesRef, orderByChild('conversationId'), equalTo(conversationId));
      const snapshot = await get(messagesQuery);
      
      if (snapshot.exists()) {
        const messages: Message[] = [];
        snapshot.forEach((childSnapshot) => {
          messages.push(childSnapshot.val());
        });
        return messages.sort((a, b) => a.timestamp - b.timestamp);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting messages from Firebase:', error);
      
      // Fallback to localStorage
      try {
        const messagesJson = localStorage.getItem('messages');
        const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
        const conversationMessages = messages
          .filter(m => m.conversationId === conversationId)
          .sort((a, b) => a.timestamp - b.timestamp);
        return conversationMessages;
      } catch (localError) {
        console.error('Error getting messages from localStorage fallback:', localError);
        return [];
      }
    }
  }
  
  // Conversation operations
  async saveConversation(conversation: Conversation): Promise<Conversation | null> {
    try {
      await this.initialize();
      
      // Save conversation to Firebase
      await set(ref(database, `conversations/${conversation.id}`), conversation);
      return conversation;
    } catch (error) {
      console.error('Error saving conversation to Firebase:', error);
      
      // Fallback to localStorage
      try {
        const conversationsJson = localStorage.getItem('conversations');
        const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
        const conversationIndex = conversations.findIndex(c => c.id === conversation.id);
        
        if (conversationIndex >= 0) {
          conversations[conversationIndex] = conversation;
        } else {
          conversations.push(conversation);
        }
        
        localStorage.setItem('conversations', JSON.stringify(conversations));
        return conversation;
      } catch (localError) {
        console.error('Error saving conversation to localStorage fallback:', localError);
        return null;
      }
    }
  }
  
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    try {
      await this.initialize();
      
      // Get all conversations from Firebase
      const snapshot = await get(ref(database, 'conversations'));
      if (snapshot.exists()) {
        const conversations: Conversation[] = [];
        snapshot.forEach((childSnapshot) => {
          const conversation = childSnapshot.val();
          // Filter conversations by user ID
          if (conversation.participants.some((p: any) => p.id === userId)) {
            conversations.push(conversation);
          }
        });
        return conversations;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting conversations from Firebase:', error);
      
      // Fallback to localStorage
      try {
        const conversationsJson = localStorage.getItem('conversations');
        const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
        const userConversations = conversations.filter(c => 
          c.participants.some(p => p.id === userId));
        return userConversations;
      } catch (localError) {
        console.error('Error getting conversations from localStorage fallback:', localError);
        return [];
      }
    }
  }
}

// Export singleton instance
const browserDb = new BrowserDb();
export default browserDb;
