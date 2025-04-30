
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user?.isAdmin) {
      // Redirect admin to the admin panel
      navigate("/admin");
    } else {
      // Redirect regular users to the chat interface
      navigate("/chat");
    }
  }, [navigate, user, isAuthenticated]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading appropriate interface...</p>
    </div>
  );
};

export default Index;
