import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, DollarSign, Cloud, Eye, Edit3, Sparkles, Mountain, TreePine, Utensils } from "lucide-react";
import khonkaenHero from "@/assets/khonkaen-hero.jpg";

interface TripCollection {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  weatherToday?: {
    temp: number;
    condition: string;
  };
  totalDays: number;
  totalActivities: number;
  hasPlans: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock data for demo
  const [collections] = useState<TripCollection[]>([
    {
      id: "ck123abc",
      name: "ทริปครอบครัวขอนแก่น 3 วัน",
      category: "ครอบครัว",
      startDate: "2025-04-10",
      endDate: "2025-04-12",
      budget: 9000,
      weatherToday: { temp: 32, condition: "แดดจัด" },
      totalDays: 3,
      totalActivities: 8,
      hasPlans: true
    },
    {
      id: "ck456def",
      name: "ทริปเพื่อนฝูง 2 วัน — ขอนแก่น-มหาวิทยาลัยขอนแก่น",
      category: "เพื่อนฝูง",
      startDate: "2025-04-15",
      endDate: "2025-04-16",
      budget: 6500,
      weatherToday: { temp: 29, condition: "มีฝนเล็กน้อย" },
      totalDays: 2,
      totalActivities: 5,
      hasPlans: true
    },
    {
      id: "ck789ghi",
      name: "ทริปคนเดียว — ตลาดเหนือ & หอศิลป์",
      category: "คนเดียว",
      startDate: "2025-04-20",
      endDate: "2025-04-20",
      budget: 4000,
      totalDays: 1,
      totalActivities: 0,
      hasPlans: false
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ครอบครัว": return "🏺";
      case "เพื่อนฝูง": return "🧑‍🤝‍🧑";
      case "คู่รัก": return "💑";
      case "คนเดียว": return "👤";
      case "นักเรียน": return "🎓";
      default: return "📍";
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("แดด")) return "☀️";
    if (condition.includes("ฝน")) return "🌧️";
    if (condition.includes("เมฆ")) return "🌤️";
    return "🌤️";
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    return `${start.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}–${end.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-3xl animate-float">🌿</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground font-kanit">KhonKaenTravelAI</h1>
                <p className="text-xs text-muted-foreground font-sarabun">วางแผนเที่ยวขอนแก่นอย่างชาญฉลาด</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-prompt hover:scale-105 transition-transform">
                🔍 ค้นหา
              </Button>
              <Button variant="ghost" size="sm" className="font-prompt hover:scale-105 transition-transform">
                👤 โปรไฟล์
              </Button>
              <Button variant="ghost" size="sm" className="font-prompt hover:scale-105 transition-transform">
                ⚙️ ตั้งค่า
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-96 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${khonkaenHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-khonkaen-primary/20 to-khonkaen-nature/20"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Mountain className="w-8 h-8 text-white animate-float" />
              <Sparkles className="w-6 h-6 text-white animate-glow" />
              <TreePine className="w-8 h-8 text-white animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white font-kanit drop-shadow-lg">
              🎯 ยินดีต้อนรับสู่ขอนแก่น
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-sarabun drop-shadow-md">
              เก็บเกี่ยวประสบการณ์ วางแผนอย่างชาญฉลาด ด้วย AI
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={() => navigate('/create-collection')}
                className="font-prompt animate-glow hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                <Plus className="w-6 h-6" />
                สร้างทริปใหม่
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="secondary" 
                size="xl" 
                onClick={() => navigate('/restaurant-search')}
                className="font-prompt animate-glow hover:scale-110 transition-all duration-300 shadow-2xl bg-khonkaen-warm/90 hover:bg-khonkaen-warm text-white border-0"
              >
                <Utensils className="w-6 h-6" />
                ร้านอาหารใกล้ฉัน
                <span className="text-lg ml-2">🍜</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/50 to-transparent"></div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Collections Section */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-2xl font-bold text-foreground font-kanit mb-2 flex items-center gap-2">
            📁 ทริปของคุณ
            <span className="text-sm font-normal text-muted-foreground">({collections.length} ทริป)</span>
          </h3>
          <p className="text-muted-foreground font-sarabun">จัดการและติดตามแผนการท่องเที่ยวของคุณ</p>
        </div>

        {/* Collections Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Card 
              key={collection.id} 
              className="group shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in overflow-hidden"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              {/* Card Header with gradient */}
              <div className="h-2 bg-gradient-to-r from-khonkaen-primary via-khonkaen-warm to-khonkaen-nature"></div>
              
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-kanit">
                  📁 COLLECTION #{collection.id.slice(-3).toUpperCase()}
                </CardTitle>
                <CardDescription className="text-base font-medium text-foreground font-sarabun line-clamp-2">
                  {collection.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                  <span className="text-lg">{getCategoryIcon(collection.category)}</span>
                  <span>หมวดหมู่: {collection.category}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                  <Calendar className="w-4 h-4 text-khonkaen-primary" />
                  <span>{formatDateRange(collection.startDate, collection.endDate)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                  <DollarSign className="w-4 h-4 text-khonkaen-warm" />
                  <span className="font-semibold">{collection.budget.toLocaleString()} บาท</span>
                </div>
                
                {collection.weatherToday && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                    <Cloud className="w-4 h-4 text-khonkaen-culture" />
                    <span>อากาศ: {getWeatherIcon(collection.weatherToday.condition)} {collection.weatherToday.condition} ({collection.weatherToday.temp}°C)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                  <MapPin className="w-4 h-4 text-khonkaen-nature" />
                  <span>{collection.totalDays} วัน / {collection.totalActivities} กิจกรรม</span>
                </div>
                
                <div className="pt-3 border-t border-border/30">
                  {collection.hasPlans ? (
                    <Button 
                      variant="khonkaen" 
                      size="sm" 
                      className="w-full font-prompt group-hover:scale-105 transition-transform"
                      onClick={() => navigate(`/plan/${collection.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                      ▶ ดูแผนทริป
                    </Button>
                  ) : (
                    <>
                      <div className="text-sm text-warning mb-3 font-prompt bg-warning/10 p-2 rounded-lg border border-warning/20">
                        ❓ ยังไม่มีแผนวันแรก — กด "แก้ไข" เพื่อเริ่ม
                      </div>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        className="w-full font-prompt group-hover:scale-105 transition-transform"
                        onClick={() => navigate(`/plan/${collection.id}`)}
                      >
                        <Edit3 className="w-4 h-4" />
                        ✏️ เริ่มวางแผน
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State or Add New Trip */}
        {collections.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4 animate-float">🗺️</div>
            <h3 className="text-2xl font-bold text-foreground font-kanit mb-2">ยังไม่มีทริป</h3>
            <p className="text-muted-foreground font-sarabun mb-6">เริ่มต้นการผจญภัยของคุณที่ขอนแก่น</p>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => navigate('/create-collection')}
              className="font-prompt animate-glow"
            >
              <Plus className="w-6 h-6" />
              สร้างทริปแรกของคุณ
            </Button>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-khonkaen-secondary/30 via-white/50 to-khonkaen-nature/20 border-khonkaen-primary/20 shadow-lg backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl mb-2">💡</div>
                  <h4 className="font-semibold font-kanit text-foreground">เคล็ดลับงบประมาณ</h4>
                  <p className="text-sm text-muted-foreground font-sarabun">
                    งบเฉลี่ย 1,500–2,500 บาท/วัน เหมาะกับทริปขอนแก่น
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl mb-2">🌤️</div>
                  <h4 className="font-semibold font-kanit text-foreground">พยากรณ์อากาศ</h4>
                  <p className="text-sm text-muted-foreground font-sarabun">
                    ระบบอัปเดตสภาพอากาศอัตโนมัติทุกวัน
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold font-kanit text-foreground">AI แนะนำ</h4>
                  <p className="text-sm text-muted-foreground font-sarabun">
                    แนะนำสถานที่และกิจกรรมตามความชอบ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-border/50 bg-gradient-to-r from-white/80 to-khonkaen-secondary/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-2xl animate-float">🌿</span>
            <span className="font-kanit font-semibold text-foreground">KhonKaenTravelAI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center font-sarabun">
            © 2025 KhonKaenTravelAI — วางแผนเที่ยวขอนแก่นอย่างชาญฉลาด ด้วยเทคโนโลยี AI
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground font-prompt">
            <span>🌟 สถานที่ท่องเที่ยว</span>
            <span>🍜 อาหารท้องถิ่น</span>
            <span>🏨 ที่พักแนะนำ</span>
            <span>🚗 การเดินทาง</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;