import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadCollectionFromLocalStorage, saveCollectionToLocalStorage, Stop } from "@/lib/storage";
import { fetchWeatherForecast } from "@/lib/weatherApi";
import PlacesTab from "@/components/plan-manager/PlacesTab";
import TransportTab from "@/components/plan-manager/TransportTab";
import AccommodationTab from "@/components/plan-manager/AccommodationTab";
import ActivitiesTab from "@/components/plan-manager/ActivitiesTab";
import DayDetailsModal from "@/components/plan-manager/DayDetailsModal";

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
  stops: Stop[];
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
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Load collection data from localStorage or use defaults
  const [collection, setCollection] = useState(() => {
    if (id) {
      const savedCollection = loadCollectionFromLocalStorage(id);
      if (savedCollection) {
        return savedCollection;
      }
    }

    // Default collection data
    return {
      collectionId: id || "",
      name: "ทริปครอบครัวขอนแก่น 3 วัน",
      category: "ครอบครัว",
      startDate: "2025-04-10",
      endDate: "2025-04-12",
      budget: 9000,
      weatherData: [] as WeatherData[],
      plans: [
        {
          day: 1,
          startLocation: "บ้านพักในตัวเมืองขอนแก่น",
          endLocation: "สวนสาธารณะศรีมหาโพธิ",
          transportation: "รถส่วนตัว",
          accommodation: "บ้านพักในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
          stops: [
            {
              name: "หอศิลปวัฒนธรรมแห่งจังหวัดขอนแก่น",
              timeStart: "09:00",
              timeEnd: "10:30",
              description: "ชมนิทรรศการศิลปะพื้นบ้าน"
            },
            {
              name: "ตลาดเหนือ",
              timeStart: "11:00",
              timeEnd: "12:00",
              description: "ชิมข้าวเหนียวหมูปิ้งและน้ำตกแตงโม"
            }
          ],
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
      ]
    };
  });

  const [plans, setPlans] = useState<Plan[]>(collection.plans);
  
  // Update collection when plans change
  useEffect(() => {
    setCollection(prev => ({
      ...prev,
      plans
    }));
  }, [plans]);

  // Fetch weather data on component mount
  useEffect(() => {
    const loadWeatherData = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        // Always fetch weather for Khon Kaen dates
        const fetchedWeather = await fetchWeatherForecast(collection.startDate, collection.endDate);
        setWeatherData(fetchedWeather);
      
        // Update collection with fetched weather data
        setCollection(prev => ({
          ...prev,
          weatherData: fetchedWeather
        }));
      } catch (error: any) {
        console.error('Failed to fetch weather data:', error);
        setWeatherError('ไม่สามารถโหลดข้อมูลสภาพอากาศได้');
      
        // Don't use fallback mock data, just show error
        setWeatherData([]);
      } finally {
        setWeatherLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  const currentPlan = plans.find(p => p.day === selectedDay);
  
  // Create a collection object that includes the fetched weather data
  const collectionWithWeather = {
    ...collection,
    weatherData: weatherData.length > 0 ? weatherData : collection.weatherData
  };
  
  const currentWeather = collectionWithWeather.weatherData.find(w => {
    const planDate = new Date(collectionWithWeather.startDate);
    planDate.setDate(planDate.getDate() + selectedDay - 1);
    return w.date === planDate.toISOString().split('T')[0];
  });

  const totalSpent = plans.reduce((total, plan) =>
    total + plan.activities.reduce((dayTotal, activity) => dayTotal + activity.cost, 0), 0
  );

  // Update functions
  const updatePlanStops = (day: number, stops: Stop[]) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.day === day ? { ...plan, stops } : plan
      )
    );
  };

  const updatePlanTransportation = (day: number, startLocation: string, endLocation: string, transportation: string) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.day === day ? { ...plan, startLocation, endLocation, transportation } : plan
      )
    );
  };

  const updatePlanAccommodation = (day: number, accommodation: string) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.day === day ? { ...plan, accommodation } : plan
      )
    );
  };

  const updatePlanActivities = (day: number, activities: Activity[]) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.day === day ? { ...plan, activities } : plan
      )
    );
  };

  // Save function to persist collection data
  const saveCollection = () => {
    // Create collection data following the schema
    const collectionToSave = {
      collectionId: collection.collectionId,
      name: collection.name,
      category: collection.category,
      startDate: collection.startDate,
      endDate: collection.endDate,
      budget: collection.budget,
      weatherData: collection.weatherData,
      plans: plans
    };

    // Save to localStorage using utility function
    saveCollectionToLocalStorage(collectionToSave);

    // Update collection state with current plans
    setCollection(prev => ({
      ...prev,
      plans
    }));

    // Show a success message
    alert("บันทึกข้อมูลสำเร็จ!");
  };

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("แดด")) return "☀️";
    if (condition.includes("ฝน")) return "🌧️";
    if (condition.includes("เมฆ")) return "🌤️";
    return "🌤️";
  };

  const getDayStatus = (dayNum: number) => {
    const plan = plans.find(p => p.day === dayNum);
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground font-kanit">KhonKaenTravelAI</h1>
              <p className="text-xs text-muted-foreground font-sarabun">จัดการแผนการท่องเที่ยว</p>
            </div>
            <Button variant="khonkaen" onClick={saveCollection} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              บันทึกข้อมูล
            </Button>
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
              {plans.map((plan) => {
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
                    onClick={() => {
                      setSelectedDay(plan.day);
                      setShowDayDetails(true);
                    }}
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
              <PlacesTab
                currentPlan={currentPlan}
                onUpdateStops={(stops) => updatePlanStops(selectedDay, stops)}
                collectionId={id}
                selectedDay={selectedDay}
              />
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-4">
              <TransportTab
                currentPlan={currentPlan}
                onUpdateTransportation={(startLocation, endLocation, transportation) =>
                  updatePlanTransportation(selectedDay, startLocation, endLocation, transportation)}
                collectionId={id}
                selectedDay={selectedDay}
              />
            </TabsContent>

            {/* Accommodation Tab */}
            <TabsContent value="accommodation" className="space-y-4">
              <AccommodationTab
                currentPlan={currentPlan}
                onUpdateAccommodation={(accommodation) => updatePlanAccommodation(selectedDay, accommodation)}
                collectionId={id}
                selectedDay={selectedDay}
              />
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              <ActivitiesTab
                currentPlan={currentPlan}
                onUpdateActivities={(activities) => updatePlanActivities(selectedDay, activities)}
                collectionId={id}
                selectedDay={selectedDay}
              />
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
          <Card className="mt-4">
            <CardContent className="pt-6">
              {weatherLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">กำลังโหลดข้อมูลสภาพอากาศ...</span>
                </div>
              ) : weatherError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-destructive">⚠️ {weatherError}</p>
                </div>
              ) : currentWeather ? (
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
                    <p className="text-sm text-muted-foreground">📅 อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-medium text-foreground">{currentWeather.forecast}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">ไม่มีข้อมูลสภาพอากาศ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal
        isOpen={showDayDetails}
        onClose={() => setShowDayDetails(false)}
        day={selectedDay}
        plan={currentPlan}
        weather={currentWeather}
        formatDate={formatDate}
        startDate={collection.startDate}
      />
    </div>
  );
};

export default PlanManager;