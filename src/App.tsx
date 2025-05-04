
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
