import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MapPin, Car, Hotel, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  cost: number;
  type: string;
}

interface Plan {
  day: number;
  startLocation: string;
  endLocation: string;
  transportation: string;
  accommodation: string;
  stops: string[];
  activities: Activity[];
}

interface WeatherData {
  date: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: string;
}

const PlanManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Mock data - in real app this would come from localStorage/API
  const collection = {
    collectionId: id,
    name: "ทริปครอบครัวขอนแก่น 3 วัน",
    category: "ครอบครัว",
    startDate: "2025-04-10",
    endDate: "2025-04-12",
    budget: 9000,
    weatherData: [
      {
        date: "2025-04-10",
        temp: 32,
        condition: "แดดจัด",
        humidity: 65,
        wind: 8,
        forecast: "อากาศร้อน แนะนำดื่มน้ำบ่อย"
      },
      {
        date: "2025-04-11",
        temp: 30,
        condition: "เมฆบางส่วน",
        humidity: 70,
        wind: 6,
        forecast: "เหมาะสำหรับเดินเล่นกลางแจ้ง"
      },
      {
        date: "2025-04-12",
        temp: 29,
        condition: "มีฝนเล็กน้อย",
        humidity: 80,
        wind: 5,
        forecast: "พกร่มไว้ด้วย"
      }
    ] as WeatherData[],
    plans: [
      {
        day: 1,
        startLocation: "บ้านพักในตัวเมืองขอนแก่น",
        endLocation: "สวนสาธารณะศรีมหาโพธิ",
        transportation: "รถส่วนตัว",
        accommodation: "บ้านพักในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
        stops: ["หอศิลปวัฒนธรรมแห่งจังหวัดขอนแก่น", "ตลาดเหนือ"],
        activities: [
          {
            title: "เยี่ยมชมสวนสาธารณะศรีมหาโพธิ",
            date: "2025-04-10",
            timeStart: "08:00",
            timeEnd: "10:00",
            description: "เดินเล่นรับลมเย็น ชมพระพุทธรูปใหญ่และทะเลสาบ",
            cost: 0,
            type: "ธรรมชาติ"
          },
          {
            title: "ทานข้าวเหนียวหมูปิ้งที่ตลาดเหนือ",
            date: "2025-04-10",
            timeStart: "12:30",
            timeEnd: "13:30",
            description: "ของดีขอนแก่น พร้อมน้ำตกแตงโมสด — ร้านอร่อยติดอันดับ",
            cost: 80,
            type: "อาหารท้องถิ่น"
          },
          {
            title: "เที่ยวหอศิลปวัฒนธรรมแห่งจังหวัดขอนแก่น",
            date: "2025-04-10",
            timeStart: "15:00",
            timeEnd: "17:00",
            description: "ชมงานศิลปะพื้นบ้านและนิทรรศการชั่วคราว",
            cost: 50,
            type: "วัฒนธรรม"
          }
        ]
      },
      {
        day: 2,
        startLocation: "บ้านพักในตัวเมืองขอนแก่น",
        endLocation: "ถนนคนเดินขอนแก่น",
        transportation: "รถส่วนตัว",
        accommodation: "บ้านพักในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
        stops: [],
        activities: [
          {
            title: "เดินเล่นถนนคนเดินขอนแก่น",
            date: "2025-04-11",
            timeStart: "17:00",
            timeEnd: "20:00",
            description: "ซื้อของที่ระลึก ทานอาหารเย็นและดื่มกาแฟ",
            cost: 200,
            type: "ช้อปปิ้ง"
          }
        ]
      },
      {
        day: 3,
        startLocation: "",
        endLocation: "",
        transportation: "",
        accommodation: "",
        stops: [],
        activities: []
      }
    ] as Plan[]
  };

  const currentPlan = collection.plans.find(p => p.day === selectedDay);
  const currentWeather = collection.weatherData.find(w => {
    const planDate = new Date(collection.startDate);
    planDate.setDate(planDate.getDate() + selectedDay - 1);
    return w.date === planDate.toISOString().split('T')[0];
  });

  const totalSpent = collection.plans.reduce((total, plan) => 
    total + plan.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0), 0
  );

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "ธรรมชาติ": return "🌿";
      case "อาหารท้องถิ่น": return "🍜";
      case "วัฒนธรรม": return "🖼️";
      case "ช้อปปิ้ง": return "🛍️";
      case "ไนท์ไลฟ์": return "🌙";
      case "ศาสนา": return "🙏";
      default: return "📍";
    }
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("แดด")) return "☀️";
    if (condition.includes("ฝน")) return "🌧️";
    if (condition.includes("เมฆ")) return "🌤️";
    return "🌤️";
  };

  const getDayStatus = (dayNum: number) => {
    const plan = collection.plans.find(p => p.day === dayNum);
    if (!plan || plan.activities.length === 0) return "empty";
    if (dayNum === selectedDay) return "active";
    return "complete";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return "✔️";
      case "active": return "▶";
      case "empty": return "⚠️";
      default: return "📅";
    }
  };

  const formatDate = (dateStr: string, dayOffset: number) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + dayOffset - 1);
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 animate-fade-in">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="hover:scale-105 transition-transform font-prompt">
              <ArrowLeft className="w-4 h-4" />
              ← กลับสู่หน้าหลัก
            </Button>
            <span className="text-3xl animate-float">🌿</span>
            <div>
              <h1 className="text-xl font-bold text-foreground font-kanit">KhonKaenTravelAI</h1>
              <p className="text-xs text-muted-foreground font-sarabun">จัดการแผนการท่องเที่ยว</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex w-full min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-60 bg-white/50 border-r border-border/50 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">ทริป:</h3>
            <p className="font-medium text-foreground">{collection.name}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">วันที่ในทริป</h4>
            <div className="space-y-2">
              {collection.plans.map((plan) => {
                const status = getDayStatus(plan.day);
                return (
                  <Card 
                    key={plan.day}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      status === "active" && "ring-2 ring-primary bg-primary/5",
                      status === "complete" && "bg-success/5 border-success/20",
                      status === "empty" && "bg-warning/5 border-warning/20"
                    )}
                    onClick={() => setSelectedDay(plan.day)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">📅 DAY {plan.day}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(collection.startDate, plan.day)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg">{getStatusIcon(status)}</span>
                          <p className="text-xs text-muted-foreground">
                            {status === "complete" && "สมบูรณ์"}
                            {status === "active" && "กำลังทำ"}
                            {status === "empty" && "ยังไม่มีแผน"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              <Button variant="hero" size="sm" className="w-full">
                <Plus className="w-4 h-4" />
                ➕ เพิ่ม Day…
              </Button>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 p-6">
          {/* Day Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                🎯 DAY {selectedDay} — {formatDate(collection.startDate, selectedDay)}
              </h2>
              {currentWeather && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{getWeatherIcon(currentWeather.condition)}</span>
                  <span>อากาศ: {currentWeather.temp}°C | {currentWeather.condition} | ความชื้น {currentWeather.humidity}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="places" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="places">สถานที่</TabsTrigger>
              <TabsTrigger value="transport">การเดินทาง</TabsTrigger>
              <TabsTrigger value="accommodation">ที่พัก</TabsTrigger>
              <TabsTrigger value="activities">กิจกรรม</TabsTrigger>
            </TabsList>

            {/* Places Tab */}
            <TabsContent value="places" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    📍 สถานที่ที่จะเยี่ยมชมในวันนี้
                  </CardTitle>
                  <CardDescription>
                    ระบุจุดที่คุณอยากไปเที่ยว — นอกเหนือจากจุดเริ่ม/สิ้นสุด
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPlan?.stops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div>
                        <p className="font-medium">▶ {stop}</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        ➖ ลบ
                      </Button>
                    </div>
                  ))}
                  
                  <Button variant="khonkaen" className="w-full">
                    <Plus className="w-4 h-4" />
                    เพิ่มสถานที่ใหม่
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    🚗 การเดินทางในวันนี้
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">📍 จุดเริ่มต้น:</label>
                      <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.startLocation || "ยังไม่ได้ระบุ"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">📍 จุดสิ้นสุด:</label>
                      <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.endLocation || "ยังไม่ได้ระบุ"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">🚗 วิธีการเดินทาง:</label>
                      <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.transportation || "ยังไม่ได้เลือก"}</p>
                    </div>
                  </div>
                  
                  {currentPlan?.startLocation && currentPlan?.endLocation && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        ⏱️ เวลาประมาณ: 15 นาที | 📏 ระยะทาง: 3.2 กม.
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        💡 คำแนะนำจาก AI: คุณเลือก 'รถส่วนตัว' จาก 'บ้านพัก' ไป 'สวนสาธารณะศรีมหาโพธิ' — เส้นทางโดยเฉลี่ยใช้เวลา 15 นาที ผ่านถนนมิตรภาพ
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accommodation Tab */}
            <TabsContent value="accommodation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="w-5 h-5" />
                    🏨 ที่พักในวันนี้
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">ชื่อที่พัก:</label>
                      <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.accommodation || "ยังไม่ได้ระบุ"}</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        💡 คำแนะนำ: จองที่พักในเขตตัวเมืองจะสะดวกต่อการเดินทาง
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    📌 กิจกรรมวันนี้ ({currentPlan?.activities.length || 0} รายการ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentPlan?.activities.map((activity, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">▶ {activity.title}</h4>
                        <Button variant="destructive" size="sm">
                          ➖ ลบ
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>🕐 {activity.timeStart}–{activity.timeEnd}</span>
                        <span>💰 {activity.cost} บาท</span>
                        <Badge variant="secondary">
                          {getActivityTypeIcon(activity.type)} {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ℹ️ {activity.description}
                      </p>
                    </div>
                  ))}
                  
                  <Button variant="hero" className="w-full">
                    <Plus className="w-4 h-4" />
                    ➕ เพิ่มกิจกรรมใหม่
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Budget Summary */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  💰 งบรวม: {collection.budget.toLocaleString()} บาท | ใช้ไปแล้ว: {totalSpent} บาท | เหลือ: {(collection.budget - totalSpent).toLocaleString()} บาท
                </span>
                <Badge variant={totalSpent > collection.budget ? "destructive" : "secondary"}>
                  {totalSpent > collection.budget ? "เกินงบ!" : "งบยังไม่เกิน — ยังมีโอกาสเพิ่มกิจกรรมได้อีก!"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Weather Card */}
          {currentWeather && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getWeatherIcon(currentWeather.condition)}</span>
                    <div>
                      <p className="font-medium">🌤️ สภาพอากาศวันนี้</p>
                      <p className="text-sm text-muted-foreground">
                        {currentWeather.condition} | 🌡️ {currentWeather.temp}°C | 💧 {currentWeather.humidity}% | 💨 {currentWeather.wind} km/h
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">📅 อัปเดตล่าสุด: 09:15 น.</p>
                    <p className="text-sm font-medium text-foreground">{currentWeather.forecast}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanManager;