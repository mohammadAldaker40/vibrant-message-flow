
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { currentUser, conversations, messages } from "./data/mockData";
import Chat from "./pages/Chat";
import LoginForm from "./components/LoginForm";
import AdminPanel from "./pages/AdminPanel";
import SettingsPage from "./pages/Settings";
import { useEffect, useState } from "react";
import browserDb from "./services/browserDb";
import { toast } from "./hooks/use-toast";
import { database } from "./config/firebase";
import { ref, onValue } from "firebase/database";

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
  
  // Initialize database connection
  useEffect(() => {
    const initDb = async () => {
      try {
        // Test Firebase connection
        const connectedRef = ref(database, '.info/connected');
        onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            setDbConnected(true);
            toast({
              title: "Firebase connected",
              description: "Successfully connected to Firebase Realtime Database",
            });
          } else {
            setDbConnected(false);
            toast({
              title: "Firebase connection waiting",
              description: "Attempting to connect to Firebase, falling back to local storage if needed.",
            });
          }
        });
        
        // Also initialize our browserDb which handles fallbacks
        const connected = await browserDb.initialize();
        if (!connected) {
          toast({
            title: "Database initialization failed",
            description: "Failed to initialize database service. Using fallback storage.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        toast({
          title: "Database error",
          description: "Could not initialize database. Using fallback storage.",
          variant: "destructive"
        });
      }
    };
    
    initDb();
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
