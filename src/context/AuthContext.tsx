
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { currentUser } from '../data/mockData';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if the user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const login = async (username: string, password: string): Promise<void> => {
    // In a real app, we'd validate credentials against an API
    // For demo purposes, we'll just accept any login
    try {
      // Simple validation
      if (!username || !password) {
        throw new Error('Username and password are required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock user data
      setUser(currentUser);
      setIsAuthenticated(true);
      
      // Store user info in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(currentUser));
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const register = async (username: string, email: string, password: string): Promise<void> => {
    // In a real app, we'd send registration data to an API
    try {
      // Simple validation
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user (in a real app, this would come from the API)
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        avatar: `https://i.pravatar.cc/150?u=${username}`,
        isOnline: true,
      };
      
      // Log the user in automatically after registration
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  const logout = () => {
    // Clear user data
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      register, 
      logout 
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
