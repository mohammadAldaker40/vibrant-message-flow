
import React, { useState } from 'react';
import { Conversation, User } from '../types';
import ConversationItem from './ConversationItem';
import { Search, Plus, UserPlus, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { database } from '../config/firebase';
import { ref, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [usernameToSearch, setUsernameToSearch] = useState('');
  
  const filteredConversations = conversations.filter(conversation => {
    // For group chats, check group name
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // For individual chats, check the other participant's name
    const otherParticipant = conversation.participants.find(p => p.id !== (user?.id || 'user-1'));
    
    // Don't show conversations with blocked users
    if (user?.blockedUsers?.includes(otherParticipant?.id || '')) {
      return false;
    }
    
    return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const searchUsers = async () => {
    if (!usernameToSearch.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Search for users with matching username
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const allUsers: User[] = [];
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (userData.id !== user?.id && 
              userData.username.toLowerCase().includes(usernameToSearch.toLowerCase()) && 
              !user?.blockedUsers?.includes(userData.id)) {
            allUsers.push(userData);
          }
        });
        
        setSearchResults(allUsers);
      } else {
        toast({
          title: "No users found",
          description: "Could not find any users with that username.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const startConversation = async (selectedUser: User) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.some(p => p.id === selectedUser.id) && !conv.isGroup
    );
    
    if (existingConversation) {
      onSelectConversation(existingConversation.id);
      setSearchDialogOpen(false);
      return;
    }
    
    try {
      // Create new conversation
      if (user) {
        const newConversationId = `conversation-${Date.now()}`;
        const newConversation: Conversation = {
          id: newConversationId,
          participants: [user, selectedUser],
          unreadCount: 0,
          isGroup: false,
          typing: false
        };
        
        // Save to Firebase
        await set(ref(database, `conversations/${newConversationId}`), newConversation);
        
        // Select the new conversation
        onSelectConversation(newConversationId);
        setSearchDialogOpen(false);
        
        toast({
          title: "Conversation created",
          description: `Started a new conversation with ${selectedUser.username}`
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleBlockUser = async (userToBlock: User) => {
    if (!user) return;
    
    try {
      // Get current blocked users or initialize empty array
      const blockedUsers = user.blockedUsers || [];
      
      // Add user to blocked list if not already blocked
      if (!blockedUsers.includes(userToBlock.id)) {
        const updatedBlockedUsers = [...blockedUsers, userToBlock.id];
        
        // Update user in Firebase
        await set(ref(database, `users/${user.id}/blockedUsers`), updatedBlockedUsers);
        
        // Update local user state
        const updatedUser = {
          ...user,
          blockedUsers: updatedBlockedUsers
        };
        
        // Update user in Auth context
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        toast({
          title: "User blocked",
          description: `${userToBlock.username} has been blocked`
        });
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800">
      <div className="p-4 border-b dark:border-gray-800">
        <h2 className="font-semibold text-xl mb-4">Messages</h2>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 bg-gray-100 dark:bg-gray-800 border-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center justify-center gap-2" onClick={() => setSearchDialogOpen(true)}>
              <UserPlus size={16} />
              <span>New Conversation</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find Users</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Search by username..." 
                  value={usernameToSearch} 
                  onChange={(e) => setUsernameToSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                />
                <Button onClick={searchUsers} disabled={isSearching}>
                  <Search size={16} className="mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(foundUser => (
                      <div key={foundUser.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={foundUser.avatar || '/lovable-uploads/337fa0f8-332c-4d9b-96ab-cbd5e91e2b56.png'} alt={foundUser.username} />
                            <AvatarFallback>{foundUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{foundUser.username}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(foundUser)}
                          >
                            <Ban size={16} className="mr-1" />
                            Block
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => startConversation(foundUser)}
                          >
                            <Plus size={16} className="mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isSearching ? (
                  <p className="text-center text-gray-500">Searching...</p>
                ) : usernameToSearch ? (
                  <p className="text-center text-gray-500">No users found</p>
                ) : (
                  <p className="text-center text-gray-500">Type a username to search</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
