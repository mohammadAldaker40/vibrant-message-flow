
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, LogOut, UserCheck, UserX } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { user, pendingRegistrations, approveRegistration, rejectRegistration, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
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
            <h1 className="text-xl font-bold text-gray-900">ModernChat Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Logged in as {user.username}</span>
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
        <Card>
          <CardHeader>
            <CardTitle>User Registration Requests</CardTitle>
            <CardDescription>
              Approve or reject user registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        ) : request.status === 'approved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => rejectRegistration(request.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
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
      </main>
    </div>
  );
};

export default AdminPanel;
