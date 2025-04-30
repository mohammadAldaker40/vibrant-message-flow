
import { User, Message, Conversation } from '../types';

// Empty arrays for conversations and contacts since we want only admin-approved users
export const currentUser: User = {
  id: 'user-1',
  username: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?img=8',
  isOnline: true,
};

export const contacts: User[] = [];

export const messages: Record<string, Message[]> = {};

export const conversations: Conversation[] = [];
