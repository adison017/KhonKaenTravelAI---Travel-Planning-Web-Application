import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hotel, MapPin, Search } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";
import { loadCollectionFromLocalStorage } from "@/lib/storage";

interface Plan {
  accommodation: string;
}

interface AccommodationTabProps {
  currentPlan: Plan | undefined;
  onUpdateAccommodation?: (accommodation: string) => void;
  collectionId?: string;
  selectedDay?: number;
}

const AccommodationTab = ({ currentPlan, onUpdateAccommodation, collectionId, selectedDay }: AccommodationTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accommodation, setAccommodation] = useState(currentPlan?.accommodation || "");
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      
      // If we have localStorage data and a selected day, use that data
      if (data && selectedDay) {
        const planForDay = data.plans.find((plan: any) => plan.day === selectedDay);
        if (planForDay) {
          setAccommodation(planForDay.accommodation || "");
        }
      }
    }
  }, [collectionId, selectedDay]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await googleMapsService.searchPlaces(searchTerm + " โรงแรม ขอนแก่น");
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching accommodations:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAccommodation = (description: string) => {
    setAccommodation(description);
    setSearchTerm("");
    setSearchResults([]);
  };

  // Update the parent component when accommodation changes
  useEffect(() => {
    if (onUpdateAccommodation) {
      onUpdateAccommodation(accommodation);
    }
  }, [accommodation, onUpdateAccommodation]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="w-5 h-5" />
          🏨 ที่พักในวันนี้
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ หมายเหตุ: ข้อมูลที่พักในแถบนี้เป็นข้อมูลอ้างอิงเท่านั้น 
              ไม่ควรถูกใช้เป็นจุดเริ่มต้นหรือจุดสิ้นสุดในการเดินทาง
              ระบบจะบันทึกจุดเริ่มต้น/สิ้นสุดแยกต่างหากในแท็บ "การเดินทาง"
            </p>
          </div>
          
          {/* LocalStorage Data Display - Only for selected day */}
          {localStorageData && selectedDay && (
            <div className="text-xs text-muted-foreground mb-2">
              แสดงข้อมูลจาก LocalStorage: {localStorageData.name} (Day {selectedDay})
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="ค้นหาที่พักในขอนแก่น..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <div 
                    key={result.place_id}
                    className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectAccommodation(result.description)}
                  >
                    <p className="text-sm">{result.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">ชื่อที่พัก:</label>
            <Input
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value)}
              placeholder="ระบุที่พัก"
              className="mt-1"
            />
          </div>
          
          {/* Map Preview */}
          <div 
            ref={mapRef} 
            className="h-48 rounded-lg border"
          />
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 คำแนะนำ: จองที่พักในเขตตัวเมืองจะสะดวกต่อการเดินทาง
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationTab;
