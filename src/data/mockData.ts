
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
  settings: {
    theme: 'system',
    notifications: true,
    language: 'en',
    status: 'available',
    displayName: 'John Doe',
    bio: 'I love chatting with friends!'
  }
};

export const contacts: User[] = [];

export const messages: Record<string, Message[]> = {};

export const conversations: Conversation[] = [];
