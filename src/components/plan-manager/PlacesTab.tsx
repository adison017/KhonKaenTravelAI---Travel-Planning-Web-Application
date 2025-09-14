import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Search, X } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";
import { loadCollectionFromLocalStorage, Stop } from "@/lib/storage";

interface Plan {
  stops: Stop[];
}

interface PlacesTabProps {
  currentPlan: Plan | undefined;
  onUpdateStops?: (stops: Stop[]) => void;
  collectionId?: string;
  selectedDay?: number;
  onSetStartLocation?: (location: string) => void; // New prop to set start location in TransportTab
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

const PlacesTab = ({ currentPlan, onUpdateStops, collectionId, selectedDay, onSetStartLocation }: PlacesTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
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
    }
  }, [collectionId, selectedDay]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await googleMapsService.searchPlaces(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStop = (description: string) => {
    if (onUpdateStops && currentPlan) {
      const newStop: Stop = {
        name: description,
        timeStart: "",
        timeEnd: "",
        description: ""
      };
      const newStops = [...currentPlan.stops, newStop];
      onUpdateStops(newStops);
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleRemoveStop = (index: number) => {
    if (onUpdateStops && currentPlan) {
      const newStops = currentPlan.stops.filter((_, i) => i !== index);
      onUpdateStops(newStops);
    }
  };

  const handleUpdateStop = (index: number, field: keyof Stop, value: string) => {
    if (onUpdateStops && currentPlan) {
      const newStops = [...currentPlan.stops];
      newStops[index] = { ...newStops[index], [field]: value };
      onUpdateStops(newStops);
    }
  };

  const handleSetAsStartLocation = (stopName: string) => {
    if (onSetStartLocation) {
      onSetStartLocation(stopName);
      alert(`ตั้งค่า "${stopName}" เป็นจุดเริ่มต้นสำเร็จ!`);
    }
  };

  const handleSave = () => {
    // Trigger save by calling onUpdateStops with current stops to ensure data is persisted
    if (onUpdateStops && currentPlan) {
      const stopsCount = currentPlan.stops.length;
      onUpdateStops([...currentPlan.stops]);

      let message = `บันทึกข้อมูลจุดแวะพักเรียบร้อยแล้ว!\n\n`;
      message += `📍 จำนวนจุดแวะพัก: ${stopsCount} จุด\n`;

      if (stopsCount > 0) {
        message += `📋 รายการจุดแวะพัก:\n`;
        currentPlan.stops.forEach((stop, index) => {
          message += `${index + 1}. ${stop.name}\n`;
        });
      } else {
        message += `⚠️ ไม่มีจุดแวะพักในวันนี้`;
      }

      alert(message);
    }
  };

  const showLocationOnMap = async (location: string) => {
    if (!location) return;
    
    try {
      // Use the places service to search for the location
      if (googleMapsService.getMapInstance()) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const map = googleMapsService.getMapInstance();
            if (map) {
              map.setCenter(results[0].geometry.location);
              map.setZoom(15);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error showing location on map:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          📍 จุดแวะพักในวันนี้
        </CardTitle>
        <CardDescription>
          ระบุจุดที่คุณอยากไปเที่ยว — นอกเหนือจากจุดเริ่ม/สิ้นสุด
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              placeholder="ค้นหาสถานที่ในขอนแก่น..."
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
                  className="p-2 hover:bg-secondary cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                  onClick={() => handleAddStop(result.description)}
                >
                  <p className="text-sm">{result.description}</p>
                  <Plus className="w-4 h-4 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div 
          ref={mapRef} 
          className="h-48 rounded-lg border"
        />

        {/* Current Stops - Displayed as "จุดแวะพัก" cards */}
        <div className="space-y-3">
          <h3 className="font-medium text-lg">📋 รายการจุดแวะพัก</h3>
          {currentPlan?.stops.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              ยังไม่มีจุดแวะพักในวันนี้ — เพิ่มจุดแวะพักด้านล่าง
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan?.stops.map((stop, index) => {
              const duration = calculateDuration(stop.timeStart, stop.timeEnd);
              return (
                <Card 
                  key={index} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => showLocationOnMap(stop.name)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        จุดแวะพักที่ {index + 1}
                      </h4>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStop(index);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="font-medium text-lg">{stop.name}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">เวลาเริ่มต้น</label>
                        <Input
                          type="time"
                          value={stop.timeStart}
                          onChange={(e) => handleUpdateStop(index, 'timeStart', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">เวลาสิ้นสุด</label>
                        <Input
                          type="time"
                          value={stop.timeEnd}
                          onChange={(e) => handleUpdateStop(index, 'timeEnd', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">คำอธิบาย</label>
                      <Input
                        value={stop.description}
                        onChange={(e) => handleUpdateStop(index, 'description', e.target.value)}
                        placeholder="คำอธิบายสถานที่..."
                        className="text-sm"
                      />
                    </div>
                    {duration && (
                      <div className="text-sm text-muted-foreground">
                        ⏱️ ใช้เวลา: {duration}
                      </div>
                    )}
                    <Button 
                      variant="khonkaen" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetAsStartLocation(stop.name);
                      }}
                    >
                      📍 ใช้เป็นจุดเริ่มต้น
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="khonkaen" 
            className="flex-1"
            onClick={() => {
              // Add a blank stop for manual entry
              if (onUpdateStops && currentPlan) {
                const newStop: Stop = {
                  name: "",
                  timeStart: "",
                  timeEnd: "",
                  description: ""
                };
                const newStops = [...currentPlan.stops, newStop];
                onUpdateStops(newStops);
              }
            }}
          >
            <Plus className="w-4 h-4" />
            เพิ่มจุดแวะพัก
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlacesTab;
