import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-khonkaen-secondary">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">🌿</div>
        <h1 className="text-2xl font-bold text-foreground">กำลังโหลด KhonKaenTravelAI...</h1>
      </div>
    </div>
  );
};

export default Index;
