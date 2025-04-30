
import { User, Message, Conversation } from '../types';

export const currentUser: User = {
  id: 'user-1',
  username: 'John Doe',
  avatar: 'https://i.pravatar.cc/150?img=8',
  isOnline: true,
};

export const contacts: User[] = [
  {
    id: 'user-2',
    username: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isOnline: true,
  },
  {
    id: 'user-3',
    username: 'Michael Brown',
    avatar: 'https://i.pravatar.cc/150?img=11',
    isOnline: false,
  },
  {
    id: 'user-4',
    username: 'Sophia Davis',
    avatar: 'https://i.pravatar.cc/150?img=9',
    isOnline: true,
  },
  {
    id: 'user-5',
    username: 'William Johnson',
    avatar: 'https://i.pravatar.cc/150?img=6',
    isOnline: false,
  },
  {
    id: 'user-6',
    username: 'Design Team',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
  },
  {
    id: 'user-7',
    username: 'Development Team',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: true,
  },
];

export const messages: Record<string, Message[]> = {
  'conversation-1': [
    {
      id: 'msg-1',
      senderId: 'user-2',
      content: 'Hey there! How are you doing today?',
      timestamp: Date.now() - 3600000 * 2,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      senderId: 'user-1',
      content: 'Hi Emma! I\'m doing great, thanks for asking. How about you?',
      timestamp: Date.now() - 3600000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-3',
      senderId: 'user-2',
      content: 'I\'m good too! Just finished that project we were working on.',
      timestamp: Date.now() - 2700000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-4',
      senderId: 'user-1',
      content: 'That\'s awesome! Would love to see the results.',
      timestamp: Date.now() - 2400000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-5',
      senderId: 'user-2',
      content: 'I\'ll share the link in a minute!',
      timestamp: Date.now() - 1800000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-6',
      senderId: 'user-2',
      content: 'Check out our latest design!',
      timestamp: Date.now() - 600000,
      isRead: false,
      type: 'image',
      mediaUrl: 'https://source.unsplash.com/random/600x400?design',
    },
  ],
  'conversation-2': [
    {
      id: 'msg-7',
      senderId: 'user-3',
      content: 'Hi John, did you get my email about the meeting tomorrow?',
      timestamp: Date.now() - 86400000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-8',
      senderId: 'user-1',
      content: 'Yes, I got it. I\'ll be there at 10am.',
      timestamp: Date.now() - 82800000,
      isRead: true,
      type: 'text',
    },
  ],
  'conversation-3': [
    {
      id: 'msg-9',
      senderId: 'user-6',
      content: 'Team, we need to finalize the mockups by Friday.',
      timestamp: Date.now() - 172800000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-10',
      senderId: 'user-1',
      content: 'I\'ve almost completed the user dashboard section.',
      timestamp: Date.now() - 169200000,
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-11',
      senderId: 'user-4',
      content: 'I\'m working on the mobile responsive views.',
      timestamp: Date.now() - 165600000,
      isRead: true,
      type: 'text',
    },
  ],
};

export const conversations: Conversation[] = [
  {
    id: 'conversation-1',
    participants: [currentUser, contacts[0]],
    lastMessage: messages['conversation-1'][messages['conversation-1'].length - 1],
    unreadCount: 1,
    isGroup: false,
    typing: false,
  },
  {
    id: 'conversation-2',
    participants: [currentUser, contacts[1]],
    lastMessage: messages['conversation-2'][messages['conversation-2'].length - 1],
    unreadCount: 0,
    isGroup: false,
    typing: false,
  },
  {
    id: 'conversation-3',
    participants: [currentUser, contacts[0], contacts[2], contacts[3]],
    lastMessage: messages['conversation-3'][messages['conversation-3'].length - 1],
    unreadCount: 0,
    isGroup: true,
    groupName: 'Design Team',
    groupAvatar: 'https://i.pravatar.cc/150?img=1',
    typing: true,
  },
];
