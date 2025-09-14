import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, DollarSign, Cloud, Eye, Edit3, Mountain, TreePine, Trash2 } from "lucide-react";
import { listCollectionIds, loadCollectionFromLocalStorage } from "@/lib/storage";
import khonkaenHero from "@/assets/khonkaen-hero.jpg";

interface TripCollection {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  weatherData: any[];
  plans: any[];
  totalDays: number;
  totalActivities: number;
  hasPlans: boolean;
}

const MyCollections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<TripCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load collections from localStorage
  useEffect(() => {
    const loadCollections = () => {
      try {
        const collectionIds = listCollectionIds();
        const loadedCollections: TripCollection[] = [];
        
        collectionIds.forEach(id => {
          const collectionData = loadCollectionFromLocalStorage(id);
          if (collectionData) {
            // Calculate total activities
            const totalActivities = collectionData.plans.reduce(
              (total, plan) => total + plan.activities.length, 
              0
            );
            
            loadedCollections.push({
              id: collectionData.collectionId,
              name: collectionData.name,
              category: collectionData.category,
              startDate: collectionData.startDate,
              endDate: collectionData.endDate,
              budget: collectionData.budget,
              weatherData: collectionData.weatherData,
              plans: collectionData.plans,
              totalDays: collectionData.plans.length,
              totalActivities,
              hasPlans: collectionData.plans.length > 0
            });
          }
        });
        
        setCollections(loadedCollections);
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCollections();
  }, []);

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
    if (condition?.includes("แดด")) return "☀️";
    if (condition?.includes("ฝน")) return "🌧️";
    if (condition?.includes("เมฆ")) return "🌤️";
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

  const deleteCollection = (id: string) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่ต้องการลบทริปนี้?")) {
      try {
        localStorage.removeItem(`collection_${id}`);
        setCollections(collections.filter(collection => collection.id !== id));
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert("เกิดข้อผิดพลาดในการลบทริป");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khonkaen-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-sarabun">กำลังโหลดข้อมูลทริปของคุณ...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-muted-foreground font-sarabun">ทริปของฉัน</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="font-prompt hover:scale-105 transition-transform"
              >
                ← กลับสู่หน้าหลัก
              </Button>
              <Button 
                variant="khonkaen" 
                onClick={() => navigate('/create-collection')}
                className="font-prompt hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4 mr-2" />
                สร้างทริปใหม่
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-64 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${khonkaenHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-khonkaen-primary/20 to-khonkaen-nature/20"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-kanit drop-shadow-lg mb-2">
              🎯 ทริปการเดินทางของฉัน
            </h2>
            <p className="text-lg md:text-xl text-white/90 font-sarabun drop-shadow-md">
              จัดการและติดตามแผนการท่องเที่ยวของคุณทั้งหมดในที่เดียว
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Collections Section */}
        <div className="mb-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-foreground font-kanit mb-2 flex items-center gap-2">
            📁 ทริปของคุณ
            <span className="text-sm font-normal text-muted-foreground">({collections.length} ทริป)</span>
          </h3>
          <p className="text-muted-foreground font-sarabun">จัดการและติดตามแผนการท่องเที่ยวของคุณ</p>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => {
              // Get today's weather if available
              const today = new Date().toISOString().split('T')[0];
              const todayWeather = collection.weatherData?.find(w => w.date === today);
              
              return (
                <Card 
                  key={collection.id} 
                  className="group shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  {/* Card Header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-khonkaen-primary via-khonkaen-warm to-khonkaen-nature"></div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-kanit">
                          📁 COLLECTION #{collection.id.slice(-3).toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-foreground font-sarabun line-clamp-2">
                          {collection.name}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(collection.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
                    
                    {todayWeather && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-prompt">
                        <Cloud className="w-4 h-4 text-khonkaen-culture" />
                        <span>อากาศ: {getWeatherIcon(todayWeather.condition)} {todayWeather.condition} ({todayWeather.temp}°C)</span>
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
              );
            })}
          </div>
        ) : (
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
        {collections.length > 0 && (
          <div className="mt-16 animate-fade-in">
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
        )}
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

export default MyCollections;