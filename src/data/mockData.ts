
import { User, Message, Conversation } from '../types';

// Default avatar path
const DEFAULT_AVATAR = '/lovable-uploads/337fa0f8-332c-4d9b-96ab-cbd5e91e2b56.png';

// Empty arrays for conversations and contacts since we want only admin-approved users
export const currentUser: User = {
  id: 'user-1',
  username: 'John Doe',
  avatar: DEFAULT_AVATAR,
  isOnline: true,
  blockedUsers: [], // Initialize empty array of blocked users
  isApproved: true, // Make sure user is approved
  settings: {
    theme: 'system',
    notifications: true,
    language: 'en',
    status: 'available',
    displayName: 'John Doe',
    bio: 'I love chatting with friends!'
  }
};

// Adding some sample users for testing
export const contacts: User[] = [
  {
    id: 'user-2',
    username: 'Jane Smith',
    avatar: DEFAULT_AVATAR,
    isOnline: true,
    isApproved: true
  },
  {
    id: 'user-3',
    username: 'Bob Johnson',
    avatar: DEFAULT_AVATAR,
    isOnline: false,
    isApproved: true
  }
];

export const messages: Record<string, Message[]> = {};

export const conversations: Conversation[] = [];
