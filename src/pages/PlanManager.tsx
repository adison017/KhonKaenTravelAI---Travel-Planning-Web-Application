import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadCollectionFromLocalStorage, saveCollectionToLocalStorage, Stop } from "@/lib/storage";
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
  const [plans, setPlans] = useState<Plan[]>(() => {
    // Try to load plans from localStorage first
    if (id) {
      const savedCollection = loadCollectionFromLocalStorage(id);
      if (savedCollection) {
        return savedCollection.plans || [];
      }
    }

    // Return empty plans if nothing in localStorage
    return [];
  });
  
  // Load collection data from localStorage or use defaults
  const collection = (() => {
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
      plans: plans
    };
  })();

  const currentPlan = plans.find(p => p.day === selectedDay);
  const currentWeather = collection.weatherData.find(w => {
    const planDate = new Date(collection.startDate);
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
      prevPlans.map(plan => {
        // If endLocation is not provided, use the last stop as endLocation
        let finalEndLocation = endLocation;
        if (!endLocation && plan.stops && plan.stops.length > 0) {
          finalEndLocation = plan.stops[plan.stops.length - 1].name;
        }
        
        return plan.day === day ? { ...plan, startLocation, endLocation: finalEndLocation, transportation } : plan;
      })
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

  // Function to set start location in TransportTab
  const setStartLocationForTransport = (location: string) => {
    const currentPlan = plans.find(p => p.day === selectedDay);
    if (currentPlan) {
      updatePlanTransportation(
        selectedDay,
        location,
        currentPlan.endLocation || "",
        currentPlan.transportation || ""
      );
    }
  };

  // Function to add a new day
  const addNewDay = () => {
    const maxDay = plans.length > 0 ? Math.max(...plans.map(p => p.day)) : 0;
    const newDayNumber = maxDay + 1;

    const newPlan: Plan = {
      day: newDayNumber,
      startLocation: "",
      endLocation: "",
      transportation: "",
      accommodation: "",
      stops: [],
      activities: []
    };

    setPlans(prevPlans => [...prevPlans, newPlan]);
    setSelectedDay(newDayNumber);
  };

  // Save function to persist collection data
  const saveCollection = () => {
    // Load existing collection data or create default
    let baseCollection;
    if (id) {
      const savedCollection = loadCollectionFromLocalStorage(id);
      if (savedCollection) {
        baseCollection = savedCollection;
      }
    }

    // If no saved collection, use default
    if (!baseCollection) {
      baseCollection = {
        collectionId: id || "",
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
        ],
        plans: []
      };
    }

    // Create collection data with current plans
    const collectionToSave = {
      ...baseCollection,
      plans: plans.map(plan => {
        // Ensure endLocation is set to the last stop if not already set
        let endLocation = plan.endLocation;
        if (!endLocation && plan.stops && plan.stops.length > 0) {
          endLocation = plan.stops[plan.stops.length - 1].name;
        }

        // Ensure startLocation is not set to accommodation by default
        // Start location should be from stops or current position only
        let startLocation = plan.startLocation;
        if (startLocation.includes("บ้านพัก") || startLocation.includes("ที่พัก")) {
          // If start location was previously set to accommodation, reset it
          startLocation = "";
        }

        return {
          ...plan,
          startLocation,
          endLocation
        };
      })
    };

    // Save to localStorage using utility function
    saveCollectionToLocalStorage(collectionToSave);

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
            <Button variant="ghost" size="sm" onClick={() => navigate('/my-collections')} className="hover:scale-105 transition-transform font-prompt">
              <ArrowLeft className="w-4 h-4" />
              ← กลับสู่หน้าทริป
            </Button>
            <span className="text-3xl animate-float">🌿</span>
            <div className="flex-1">
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
              
              <Button variant="hero" size="sm" className="w-full" onClick={addNewDay}>
                <Plus className="w-4 h-4" />
                เพิ่ม Day…
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
                onUpdateStops={(stops) => {
                  updatePlanStops(selectedDay, stops);
                  // Auto-save to localStorage after updating
                  setTimeout(() => saveCollection(), 100);
                }}
                collectionId={id}
                selectedDay={selectedDay}
                onSetStartLocation={setStartLocationForTransport}
              />
            </TabsContent>

            {/* Transport Tab */}
            <TabsContent value="transport" className="space-y-4">
              <TransportTab
                currentPlan={currentPlan}
                onUpdateTransportation={(startLocation, endLocation, transportation) => {
                  updatePlanTransportation(selectedDay, startLocation, endLocation, transportation);
                  // Auto-save to localStorage after updating
                  setTimeout(() => saveCollection(), 100);
                }}
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
