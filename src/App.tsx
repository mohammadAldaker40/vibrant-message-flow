
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { conversations, messages } from "./data/mockData";
import Chat from "./pages/Chat";
import LoginForm from "./components/LoginForm";
import AdminPanel from "./pages/AdminPanel";
import SettingsPage from "./pages/Settings";
import { useEffect, useState } from "react";
import { connectToMongo } from "./services/mongodb";
import { toast } from "./hooks/use-toast";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode; adminOnly?: boolean }> = ({ 
  element, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/chat" />;
  }
  
  return <>{element}</>;
};

// Auth routes component
const AuthRoutes: React.FC = () => {
  const { isAuthenticated, login, register, user } = useAuth();
  const [dbConnected, setDbConnected] = useState(false);
  
  // Initialize MongoDB connection
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        const connected = await connectToMongo();
        setDbConnected(connected);
        if (connected) {
          toast({
            title: "Database connected",
            description: "Successfully connected to MongoDB on localhost:27017",
          });
        } else {
          toast({
            title: "Database connection failed",
            description: "Failed to connect to MongoDB. Falling back to local storage.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('MongoDB connection error:', error);
        toast({
          title: "Database error",
          description: "Could not connect to MongoDB. Please ensure MongoDB is running on localhost:27017.",
          variant: "destructive"
        });
      }
    };
    
    initMongoDB();
  }, []);

  if (isAuthenticated && user) {
    return (
      <SocketProvider
        initialConversations={conversations}
        initialMessages={messages}
        currentUser={user}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} adminOnly={true} />} />
          <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SocketProvider>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginForm onLogin={login} onRegister={register} />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
