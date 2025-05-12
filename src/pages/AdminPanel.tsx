
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, LogOut, UserCheck, UserX, UserMinus, Users } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminPanel: React.FC = () => {
  const { user, pendingRegistrations, approveRegistration, rejectRegistration, logout } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch all users from localStorage
  useEffect(() => {
    if (user?.isAdmin) {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        try {
          const parsedUsers: User[] = JSON.parse(storedUsers);
          // Filter out the current admin user
          setAllUsers(parsedUsers.filter(u => u.id !== user.id));
        } catch (error) {
          console.error('Error parsing users:', error);
        }
      }
    }
  }, [user]);

  const handleDeleteUser = (userId: string) => {
    if (!user?.isAdmin) return;
    
    // Get current users from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const parsedUsers: User[] = JSON.parse(storedUsers);
        // Remove the user to delete
        const updatedUsers = parsedUsers.filter(u => u.id !== userId);
        
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update state
        setAllUsers(updatedUsers.filter(u => u.id !== user.id));
        
        // Also remove any conversations with this user
        const storedConversations = localStorage.getItem('conversations');
        if (storedConversations) {
          const parsedConversations = JSON.parse(storedConversations);
          const updatedConversations = parsedConversations.filter((conv: any) => 
            !conv.participants.some((p: any) => p.id === userId)
          );
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        }
        
        toast({
          title: "User deleted",
          description: "User has been removed from the system",
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        });
      }
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-primary mr-2"
            >
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">ModernChat Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Logged in as {user.username}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/chat')}
              className="ml-2"
            >
              Go to Chat
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="registrations">
          <TabsList className="mb-4">
            <TabsTrigger value="registrations">Registration Requests</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Requests</CardTitle>
                <CardDescription>
                  Approve or reject user registration requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRegistrations.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No pending registration requests
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingRegistrations.map((request) => (
                      <div key={request.id} className="py-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{request.username}</h3>
                          <p className="text-sm text-gray-500">{request.email}</p>
                          <p className="text-xs text-gray-400">
                            Requested {formatDistance(request.timestamp, Date.now(), { addSuffix: true })}
                          </p>
                          <div className="mt-1">
                            {request.status === 'pending' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Pending
                              </span>
                            ) : request.status === 'approved' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => approveRegistration(request.id)}
                              className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-900"
                            >
                              <UserCheck className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => rejectRegistration(request.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900"
                            >
                              <UserX className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage existing users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allUsers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                ) : (
                  <div className="divide-y">
                    {allUsers.map((userItem) => (
                      <div key={userItem.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                            <img 
                              src={userItem.avatar || '/placeholder.svg'} 
                              alt={userItem.username} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{userItem.username}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {userItem.isOnline ? (
                                <span className="flex items-center">
                                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Online
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <span className="h-2 w-2 rounded-full bg-gray-400 mr-1"></span> Offline
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900"
                        >
                          <UserMinus className="h-4 w-4 mr-1" /> Delete User
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
