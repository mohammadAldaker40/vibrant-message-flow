
import { User, Message, Conversation } from '../types';

// Empty arrays for conversations and contacts since we want only admin-approved users
export const currentUser: User = {
  id: 'user-1',
  username: 'John Doe',
  avatar: '', // No default avatar, user should set it manually
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
    avatar: '', // No default avatar
    isOnline: true,
    isApproved: true
  },
  {
    id: 'user-3',
    username: 'Bob Johnson',
    avatar: '', // No default avatar
    isOnline: false,
    isApproved: true
  }
];

export const messages: Record<string, Message[]> = {};

export const conversations: Conversation[] = [];
