
import React, { useState } from 'react';
import { Conversation } from '../types';
import ConversationItem from './ConversationItem';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = conversations.filter(conversation => {
    // For group chats, check group name
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // For individual chats, check the other participant's name
    const otherParticipant = conversation.participants.find(p => p.id !== 'user-1');
    return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800">
      <div className="p-4 border-b dark:border-gray-800">
        <h2 className="font-semibold text-xl mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 bg-gray-100 dark:bg-gray-800 border-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
