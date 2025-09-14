import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, MapPin, Search, X } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";
import { loadCollectionFromLocalStorage } from "@/lib/storage";

interface Activity {
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  cost: number;
  type: string;
  location?: string; // Add location field
}

interface Plan {
  activities: Activity[];
}

interface ActivitiesTabProps {
  currentPlan: Plan | undefined;
  onUpdateActivities?: (activities: Activity[]) => void;
  collectionId?: string;
  selectedDay?: number;
}

// Function to calculate duration between two times in HH:MM format
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";
  
  try {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // Handle case where end time is next day (e.g., 23:00 to 01:00)
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    if (durationMinutes < 0) return "";
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} นาที`;
    } else if (minutes === 0) {
      return `${hours} ชั่วโมง`;
    } else {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "";
  }
};

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

const ActivitiesTab = ({ currentPlan, onUpdateActivities, collectionId, selectedDay }: ActivitiesTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'location'>>({
    title: "",
    date: new Date().toISOString().split('T')[0],
    timeStart: "",
    timeEnd: "",
    description: "",
    cost: 0,
    type: "ธรรมชาติ"
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await googleMapsService.load();
        if (mapRef.current) {
          const map = googleMapsService.initializeMap(mapRef.current);
          googleMapsService.initializePlacesServices(map);
        }
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    };

    initMap();
  }, []);

  // Load localStorage data when component mounts
  useEffect(() => {
    if (collectionId && selectedDay) {
      const data = loadCollectionFromLocalStorage(collectionId);
      setLocalStorageData(data);
    }
  }, [collectionId, selectedDay]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await googleMapsService.searchPlaces(searchTerm + " ขอนแก่น");
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching activities:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddActivity = () => {
    if (onUpdateActivities && currentPlan) {
      const activityToAdd: Activity = {
        ...newActivity,
        location: searchTerm || undefined
      };
      
      const newActivities = [...currentPlan.activities, activityToAdd];
      onUpdateActivities(newActivities);
      
      // Reset form
      setNewActivity({
        title: "",
        date: new Date().toISOString().split('T')[0],
        timeStart: "",
        timeEnd: "",
        description: "",
        cost: 0,
        type: "ธรรมชาติ"
      });
      setSearchTerm("");
      setSearchResults([]);
      setShowAddForm(false);
    }
  };

  const handleRemoveActivity = (index: number) => {
    if (onUpdateActivities && currentPlan) {
      const newActivities = currentPlan.activities.filter((_, i) => i !== index);
      onUpdateActivities(newActivities);
    }
  };

  const handleUpdateNewActivity = (field: keyof Omit<Activity, 'location'>, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real implementation, this might trigger additional actions
    alert("บันทึกข้อมูลกิจกรรมสำเร็จ!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          📌 กิจกรรมวันนี้ ({currentPlan?.activities.length || 0} รายการ)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LocalStorage Data Display - Only for selected day */}
        {localStorageData && selectedDay && (
          <div className="text-xs text-muted-foreground mb-2">
            แสดงข้อมูลจาก LocalStorage: {localStorageData.name} (Day {selectedDay})
          </div>
        )}

        {/* Add Activity Form */}
        {showAddForm ? (
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/30 space-y-3">
            <h4 className="font-medium">เพิ่มกิจกรรมใหม่</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">ชื่อกิจกรรม</label>
                <Input
                  value={newActivity.title}
                  onChange={(e) => handleUpdateNewActivity('title', e.target.value)}
                  placeholder="ชื่อกิจกรรม"
                />
              </div>
              <div>
                <label className="text-sm">ประเภท</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newActivity.type}
                  onChange={(e) => handleUpdateNewActivity('type', e.target.value)}
                >
                  <option value="ธรรมชาติ">ธรรมชาติ</option>
                  <option value="อาหารท้องถิ่น">อาหารท้องถิ่น</option>
                  <option value="วัฒนธรรม">วัฒนธรรม</option>
                  <option value="ช้อปปิ้ง">ช้อปปิ้ง</option>
                  <option value="ไนท์ไลฟ์">ไนท์ไลฟ์</option>
                  <option value="ศาสนา">ศาสนา</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">เวลาเริ่ม</label>
                <Input
                  type="time"
                  value={newActivity.timeStart}
                  onChange={(e) => handleUpdateNewActivity('timeStart', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm">เวลาสิ้นสุด</label>
                <Input
                  type="time"
                  value={newActivity.timeEnd}
                  onChange={(e) => handleUpdateNewActivity('timeEnd', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm">ค่าใช้จ่าย (บาท)</label>
              <Input
                type="number"
                value={newActivity.cost}
                onChange={(e) => handleUpdateNewActivity('cost', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <label className="text-sm">คำอธิบาย</label>
              <Input
                value={newActivity.description}
                onChange={(e) => handleUpdateNewActivity('description', e.target.value)}
                placeholder="คำอธิบายกิจกรรม"
              />
            </div>
            
            {/* Location Search */}
            <div className="space-y-2">
              <label className="text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" /> สถานที่
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="ค้นหาสถานที่ในขอนแก่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch} disabled={isSearching} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div 
                      key={result.place_id}
                      className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                      onClick={() => setSearchTerm(result.description)}
                    >
                      <p className="text-sm">{result.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddActivity} variant="khonkaen" size="sm">
                บันทึก
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4" />
              ➕ เพิ่มกิจกรรมใหม่
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave}
            >
              บันทึก
            </Button>
          </div>
        )}

        {/* Map Preview */}
        <div 
          ref={mapRef} 
          className="h-48 rounded-lg border"
        />

        {/* Current Activities */}
        {currentPlan?.activities.map((activity, index) => {
          const duration = calculateDuration(activity.timeStart, activity.timeEnd);
          return (
            <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">▶ {activity.title}</h4>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleRemoveActivity(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span>🕐 {activity.timeStart}–{activity.timeEnd}</span>
                {duration && <span>⏱️ {duration}</span>}
                <span>💰 {activity.cost} บาท</span>
                <Badge variant="secondary">
                  {getActivityTypeIcon(activity.type)} {activity.type}
                </Badge>
              </div>
              {activity.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                ℹ️ {activity.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivitiesTab;