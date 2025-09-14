import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-khonkaen-secondary flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="text-8xl mb-4">🌿</div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-8">ขออภัย! ไม่พบหน้าที่คุณต้องการ</p>
        <p className="text-muted-foreground mb-6">
          หน้าที่คุณกำลังมองหาอาจถูกเปลี่ยนแปลงหรือไม่มีอยู่จริง
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="hero" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
