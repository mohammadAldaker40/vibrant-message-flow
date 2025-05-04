
import { User, Message, Conversation, UserSettings } from '../types';

// Simple localStorage-based data service as MongoDB replacement
class BrowserDb {
  private initialized: boolean = false;

  // Initialize the database with default data if needed
  async initialize(): Promise<boolean> {
    try {
      if (!this.initialized) {
        // Initialize users collection if it doesn't exist
        if (!localStorage.getItem('users')) {
          localStorage.setItem('users', JSON.stringify([]));
        }
        
        // Initialize messages collection if it doesn't exist
        if (!localStorage.getItem('messages')) {
          localStorage.setItem('messages', JSON.stringify([]));
        }
        
        // Initialize conversations collection if it doesn't exist
        if (!localStorage.getItem('conversations')) {
          localStorage.setItem('conversations', JSON.stringify([]));
        }
        
        this.initialized = true;
        console.log('BrowserDb initialized');
        return true;
      }
      return this.initialized;
    } catch (error) {
      console.error('Error initializing BrowserDb:', error);
      return false;
    }
  }
  
  // User operations
  async saveUser(user: User): Promise<User | null> {
    try {
      await this.initialize();
      
      // Get existing users
      const usersJson = localStorage.getItem('users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user already exists
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex >= 0) {
        // Update existing user
        users[userIndex] = user;
      } else {
        // Add new user
        users.push(user);
      }
      
      // Save updated users array
      localStorage.setItem('users', JSON.stringify(users));
      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      return null;
    }
  }
  
  async getUser(userId: string): Promise<User | null> {
    try {
      await this.initialize();
      
      // Get users array
      const usersJson = localStorage.getItem('users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      // Find user by ID
      const user = users.find(u => u.id === userId);
      
      return user || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    try {
      await this.initialize();
      
      // Get users array
      const usersJson = localStorage.getItem('users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
  
  // User settings operations
  async updateUserSettings(userId: string, settings: UserSettings): Promise<boolean> {
    try {
      await this.initialize();
      
      // Get users array
      const usersJson = localStorage.getItem('users');
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      // Find user index
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex >= 0) {
        // Update user settings
        users[userIndex].settings = settings;
        
        // Save updated users array
        localStorage.setItem('users', JSON.stringify(users));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }
  
  // Message operations
  async saveMessage(message: Message): Promise<Message | null> {
    try {
      await this.initialize();
      
      // Get messages array
      const messagesJson = localStorage.getItem('messages');
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      // Add new message
      messages.push(message);
      
      // Save updated messages array
      localStorage.setItem('messages', JSON.stringify(messages));
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }
  
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    try {
      await this.initialize();
      
      // Get messages array
      const messagesJson = localStorage.getItem('messages');
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
      
      // Filter messages by conversation ID
      const conversationMessages = messages.filter(m => m.conversationId === conversationId)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      return conversationMessages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }
  
  // Conversation operations
  async saveConversation(conversation: Conversation): Promise<Conversation | null> {
    try {
      await this.initialize();
      
      // Get conversations array
      const conversationsJson = localStorage.getItem('conversations');
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      // Check if conversation already exists
      const conversationIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (conversationIndex >= 0) {
        // Update existing conversation
        conversations[conversationIndex] = conversation;
      } else {
        // Add new conversation
        conversations.push(conversation);
      }
      
      // Save updated conversations array
      localStorage.setItem('conversations', JSON.stringify(conversations));
      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }
  
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    try {
      await this.initialize();
      
      // Get conversations array
      const conversationsJson = localStorage.getItem('conversations');
      const conversations: Conversation[] = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      // Filter conversations by user ID
      const userConversations = conversations.filter(c => 
        c.participants.some(p => p.id === userId));
      
      return userConversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }
}

// Export singleton instance
const browserDb = new BrowserDb();
export default browserDb;
