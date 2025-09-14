import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Search } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";
import { loadCollectionFromLocalStorage } from "@/lib/storage";

interface Plan {
  startLocation: string;
  endLocation: string;
  transportation: string;
}

interface TransportTabProps {
  currentPlan: Plan | undefined;
  onUpdateTransportation?: (startLocation: string, endLocation: string, transportation: string) => void;
  collectionId?: string;
  selectedDay?: number;
}

// Function to calculate duration between two times in HH:MM format
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return "";
  
  try {
    // For transportation, we don't have specific times, so we'll just return the Google Maps duration
    // This function is here for consistency with other tabs
    return "";
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "";
  }
};

const TransportTab = ({ currentPlan, onUpdateTransportation, collectionId, selectedDay }: TransportTabProps) => {
  const [startLocation, setStartLocation] = useState(currentPlan?.startLocation || "");
  const [endLocation, setEndLocation] = useState(currentPlan?.endLocation || "");
  const [transportation, setTransportation] = useState(currentPlan?.transportation || "");
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    directions: string;
  } | null>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await googleMapsService.load();
        if (mapRef.current) {
          const map = googleMapsService.initializeMap(mapRef.current);
          googleMapsService.initializeDirectionsServices(map);
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
      
      // If we have localStorage data and a selected day, use that data
      if (data && selectedDay) {
        const planForDay = data.plans.find((plan: any) => plan.day === selectedDay);
        if (planForDay) {
          setStartLocation(planForDay.startLocation || "");
          setEndLocation(planForDay.endLocation || "");
          setTransportation(planForDay.transportation || "");
        }
      }
    }
  }, [collectionId, selectedDay]);

  const calculateRoute = async () => {
    if (!startLocation.trim() || !endLocation.trim()) return;

    try {
      const result = await googleMapsService.calculateRoute(startLocation, endLocation);
      googleMapsService.displayRoute(result);
      
      const route = result.routes[0];
      const leg = route.legs[0];
      
      setRouteInfo({
        distance: leg.distance?.text || "",
        duration: leg.duration?.text || "",
        directions: `จาก ${leg.start_address} ไปยัง ${leg.end_address}`
      });
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  const handleSave = () => {
    if (onUpdateTransportation) {
      onUpdateTransportation(startLocation, endLocation, transportation);
      alert("บันทึกข้อมูลการเดินทางสำเร็จ!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          🚗 การเดินทางในวันนี้
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LocalStorage Data Display - Only for selected day */}
        {localStorageData && selectedDay && (
          <div className="text-xs text-muted-foreground mb-2">
            แสดงข้อมูลจาก LocalStorage: {localStorageData.name} (Day {selectedDay})
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" /> จุดเริ่มต้น:
            </label>
            <div className="flex gap-2 mt-1">
              <Input
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="ระบุจุดเริ่มต้น"
              />
              <Button size="icon" variant="outline" onClick={calculateRoute}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" /> จุดสิ้นสุด:
            </label>
            <div className="flex gap-2 mt-1">
              <Input
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                placeholder="ระบุจุดสิ้นสุด"
              />
              <Button size="icon" variant="outline" onClick={calculateRoute}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">🚗 วิธีการเดินทาง:</label>
            <Input
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
              placeholder="ระบุวิธีการเดินทาง"
              className="mt-1"
            />
          </div>
          <Button onClick={handleSave} variant="khonkaen">
            บันทึกข้อมูลการเดินทาง
          </Button>
        </div>
        
        {/* Map Preview */}
        <div 
          ref={mapRef} 
          className="h-64 rounded-lg border"
        />
        
        {routeInfo && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ⏱️ เวลาประมาณ: {routeInfo.duration} | 📏 ระยะทาง: {routeInfo.distance}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              💡 คำแนะนำจาก AI: {routeInfo.directions} — เส้นทางโดยเฉลี่ยใช้เวลา {routeInfo.duration}
            </p>
          </div>
        )}
        
        {currentPlan?.startLocation && currentPlan?.endLocation && !routeInfo && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ⏱️ เวลาประมาณ: 15 นาที | 📏 ระยะทาง: 3.2 กม.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              💡 คำแนะนำจาก AI: คุณเลือก '{currentPlan.transportation}' จาก '{currentPlan.startLocation}' ไป '{currentPlan.endLocation}' — เส้นทางโดยเฉลี่ยใช้เวลา 15 นาที ผ่านถนนมิตรภาพ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportTab;