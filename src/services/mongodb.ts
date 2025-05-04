
import { MongoClient, Db, Collection } from 'mongodb';
import { User, Message, Conversation, UserSettings } from '../types';

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'chatApp';

// Create a new MongoClient
const client = new MongoClient(url);
let db: Db | null = null;

// Collections
let usersCollection: Collection<User> | null = null;
let messagesCollection: Collection<Message> | null = null;
let conversationsCollection: Collection<Conversation> | null = null;

export const connectToMongo = async (): Promise<boolean> => {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    // Get database and collections
    db = client.db(dbName);
    usersCollection = db.collection<User>('users');
    messagesCollection = db.collection<Message>('messages');
    conversationsCollection = db.collection<Conversation>('conversations');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// User operations
export const saveUser = async (user: User): Promise<User | null> => {
  try {
    if (!usersCollection) await connectToMongo();
    
    // Check if user already exists
    const existingUser = await usersCollection?.findOne({ id: user.id });
    
    if (existingUser) {
      // Update the user
      await usersCollection?.updateOne(
        { id: user.id },
        { $set: user }
      );
    } else {
      // Insert new user
      await usersCollection?.insertOne(user);
    }
    
    return user;
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    if (!usersCollection) await connectToMongo();
    return await usersCollection?.findOne({ id: userId }) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    if (!usersCollection) await connectToMongo();
    return (await usersCollection?.find().toArray()) || [];
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// User settings operations
export const updateUserSettings = async (userId: string, settings: UserSettings): Promise<boolean> => {
  try {
    if (!usersCollection) await connectToMongo();
    
    const result = await usersCollection?.updateOne(
      { id: userId },
      { $set: { settings } }
    );
    
    return result?.modifiedCount === 1;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};

// Message operations
export const saveMessage = async (message: Message): Promise<Message | null> => {
  try {
    if (!messagesCollection) await connectToMongo();
    await messagesCollection?.insertOne(message);
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
};

export const getMessagesForConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    if (!messagesCollection) await connectToMongo();
    
    // This assumes messages have a conversationId field, which isn't in your current types
    // You might need to adjust your Message type to include this
    return (await messagesCollection?.find({ conversationId }).sort({ timestamp: 1 }).toArray()) || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

// Conversation operations
export const saveConversation = async (conversation: Conversation): Promise<Conversation | null> => {
  try {
    if (!conversationsCollection) await connectToMongo();
    
    // Check if conversation already exists
    const existingConversation = await conversationsCollection?.findOne({ id: conversation.id });
    
    if (existingConversation) {
      // Update the conversation
      await conversationsCollection?.updateOne(
        { id: conversation.id },
        { $set: conversation }
      );
    } else {
      // Insert new conversation
      await conversationsCollection?.insertOne(conversation);
    }
    
    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
};

export const getConversationsForUser = async (userId: string): Promise<Conversation[]> => {
  try {
    if (!conversationsCollection) await connectToMongo();
    
    // Find conversations where the user is a participant
    return (await conversationsCollection?.find({
      'participants.id': userId
    }).toArray()) || [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

// Close the MongoDB connection when the application is shut down
export const closeMongo = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};
