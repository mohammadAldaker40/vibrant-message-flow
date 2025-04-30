
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the chat interface
    navigate("/chat");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading chat interface...</p>
    </div>
  );
};

export default Index;
