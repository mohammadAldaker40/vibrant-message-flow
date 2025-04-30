
export interface User {
  id: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  isAdmin?: boolean;
  isApproved?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
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
