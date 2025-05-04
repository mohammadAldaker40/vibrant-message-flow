
export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  isAdmin?: boolean;
  isApproved?: boolean;
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: 'en' | 'es' | 'fr' | 'de';
  status?: 'available' | 'away' | 'busy' | 'offline';
  displayName?: string;
  bio?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  conversationId?: string; // Added this field to track which conversation a message belongs to
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  typing?: boolean;
}

export interface RegistrationRequest {
  id: string;
  username: string;
  email: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}
