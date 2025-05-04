
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, RegistrationRequest } from '../types';
import { currentUser } from '../data/mockData';
import { toast } from "@/hooks/use-toast";
import { saveUser, getUser, getAllUsers } from '../services/mongodb';
import { connectToMongo } from '../services/mongodb';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  pendingRegistrations: RegistrationRequest[];
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  approveRegistration: (id: string) => void;
  rejectRegistration: (id: string) => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create admin user
const adminUser: User = {
  id: 'admin-1',
  username: 'admin',
  avatar: 'https://i.pravatar.cc/150?u=admin',
  isOnline: true,
  isAdmin: true
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingRegistrations, setPendingRegistrations] = useState<RegistrationRequest[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  
  // Connect to MongoDB when the app loads
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        const connected = await connectToMongo();
        setDbConnected(connected);
        if (connected) {
          console.log('MongoDB connected successfully');
        } else {
          console.warn('MongoDB connection failed, falling back to localStorage');
        }
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        setDbConnected(false);
      }
    };
    
    initMongoDB();
  }, []);
  
  // Try to load user from MongoDB or fall back to localStorage
  useEffect(() => {
    const initUser = async () => {
      // Try localStorage first for faster initial load
      const storedUserId = localStorage.getItem('currentUserId');
      
      if (storedUserId) {
        try {
          if (dbConnected) {
            // Try to get user from MongoDB
            const mongoUser = await getUser(storedUserId);
            
            if (mongoUser) {
              setUser(mongoUser);
              setIsAuthenticated(true);
              return;
            }
          }
          
          // Fall back to localStorage if MongoDB fails or user not found
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }
    };
    
    initUser();
  }, [dbConnected]);
  
  const login = async (username: string, password: string): Promise<void> => {
    try {
      // Simple validation
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Admin login
      if (username === 'admin' && password === 'admin') {
        setUser(adminUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('currentUserId', adminUser.id);
        
        // Also save admin to MongoDB if connected
        if (dbConnected) {
          await saveUser(adminUser);
        }
        return;
      }
      
      // Regular user login - check if user is approved
      const storedRegistrations = localStorage.getItem('pendingRegistrations');
      const rawRegistrations = storedRegistrations ? JSON.parse(storedRegistrations) : [];
      
      // Type-cast the status to ensure it matches the expected type
      const registrations: RegistrationRequest[] = rawRegistrations.map((reg: any) => ({
        ...reg,
        status: reg.status as "pending" | "approved" | "rejected"
      }));
      
      const approvedUser = registrations.find(
        reg => reg.username === username && reg.status === 'approved'
      );
      
      if (!approvedUser) {
        throw new Error('Invalid credentials or your registration has not been approved yet');
      }
      
      // Create user from approved registration
      const loggedInUser: User = {
        id: approvedUser.id,
        username: approvedUser.username,
        avatar: `https://i.pravatar.cc/150?u=${approvedUser.username}`,
        isOnline: true,
        isApproved: true
      };
      
      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('currentUserId', loggedInUser.id);
      
      // Also save to MongoDB if connected
      if (dbConnected) {
        await saveUser(loggedInUser);
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      // Simple validation
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }
      
      // Create a registration request
      const newRegistration: RegistrationRequest = {
        id: `user-${Date.now()}`,
        username,
        email,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      // Store registration request
      const storedRegistrations = localStorage.getItem('pendingRegistrations');
      const rawRegistrations = storedRegistrations ? JSON.parse(storedRegistrations) : [];
      
      // Type-cast the status to ensure it matches the expected type
      const registrations: RegistrationRequest[] = rawRegistrations.map((reg: any) => ({
        ...reg,
        status: reg.status as "pending" | "approved" | "rejected"
      }));
      
      // Check if username or email already exists
      if (registrations.some(reg => reg.username === username)) {
        throw new Error('Username already exists');
      }
      
      if (registrations.some(reg => reg.email === email)) {
        throw new Error('Email already exists');
      }
      
      // Add new registration
      const updatedRegistrations = [...registrations, newRegistration];
      localStorage.setItem('pendingRegistrations', JSON.stringify(updatedRegistrations));
      setPendingRegistrations(updatedRegistrations);
      
      toast({
        title: "Registration pending",
        description: "Your registration request has been submitted. An administrator will review your request.",
      });
      
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const approveRegistration = (id: string) => {
    if (!user?.isAdmin) return;
    
    const storedRegistrations = localStorage.getItem('pendingRegistrations');
    const rawRegistrations = storedRegistrations ? JSON.parse(storedRegistrations) : [];
    
    // Type-cast the status to ensure it matches the expected type
    const registrations: RegistrationRequest[] = rawRegistrations.map((reg: any) => ({
      ...reg,
      status: reg.status as "pending" | "approved" | "rejected"
    }));
    
    const updatedRegistrations = registrations.map(reg => 
      reg.id === id ? { ...reg, status: 'approved' as const } : reg
    );
    
    localStorage.setItem('pendingRegistrations', JSON.stringify(updatedRegistrations));
    setPendingRegistrations(updatedRegistrations);
    
    toast({
      title: "Registration approved",
      description: "User can now log in to the system",
    });
  };
  
  const rejectRegistration = (id: string) => {
    if (!user?.isAdmin) return;
    
    const storedRegistrations = localStorage.getItem('pendingRegistrations');
    const rawRegistrations = storedRegistrations ? JSON.parse(storedRegistrations) : [];
    
    // Type-cast the status to ensure it matches the expected type
    const registrations: RegistrationRequest[] = rawRegistrations.map((reg: any) => ({
      ...reg,
      status: reg.status as "pending" | "approved" | "rejected"
    }));
    
    const updatedRegistrations = registrations.map(reg => 
      reg.id === id ? { ...reg, status: 'rejected' as const } : reg
    );
    
    localStorage.setItem('pendingRegistrations', JSON.stringify(updatedRegistrations));
    setPendingRegistrations(updatedRegistrations);
    
    toast({
      title: "Registration rejected",
      description: "User registration has been rejected",
    });
  };
  
  const logout = () => {
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
  };
  
  // New function to update user data
  const updateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('currentUserId', updatedUser.id);
    
    // Update user in users array in localStorage if it exists
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    
    // Also save to MongoDB if connected
    if (dbConnected) {
      try {
        await saveUser(updatedUser);
      } catch (error) {
        console.error('Error saving user to MongoDB:', error);
        toast({
          title: "Database error",
          description: "Failed to save user to database. Changes saved locally only.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Load pending registrations for admin
  useEffect(() => {
    if (user?.isAdmin) {
      const storedRegistrations = localStorage.getItem('pendingRegistrations');
      if (storedRegistrations) {
        const rawRegistrations = JSON.parse(storedRegistrations);
        
        // Type-cast the status to ensure it matches the expected type
        const registrations: RegistrationRequest[] = rawRegistrations.map((reg: any) => ({
          ...reg,
          status: reg.status as "pending" | "approved" | "rejected"
        }));
        
        setPendingRegistrations(registrations);
      }
    }
  }, [user]);
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout,
      pendingRegistrations,
      approveRegistration,
      rejectRegistration,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
