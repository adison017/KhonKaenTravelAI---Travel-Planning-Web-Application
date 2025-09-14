import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, MapPin, Search, Plus, X, Edit, Navigation } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";
import { loadCollectionFromLocalStorage, Stop } from "@/lib/storage";

interface Plan {
  startLocation: string;
  endLocation: string;
  transportation: string;
  stops: Stop[];
}

interface TransportTabProps {
  currentPlan: Plan | undefined;
  onUpdateTransportation?: (startLocation: string, endLocation: string, transportation: string) => void;
  collectionId?: string;
  selectedDay?: number;
}

interface RouteSegment {
  from: string;
  to: string;
  distance: string;
  duration: string;
  index: number;
}

const TransportTab = ({ currentPlan, onUpdateTransportation, collectionId, selectedDay }: TransportTabProps) => {
  const [startLocation, setStartLocation] = useState(currentPlan?.startLocation || "");
  const [transportation, setTransportation] = useState(currentPlan?.transportation || "");
  const [startSearchTerm, setStartSearchTerm] = useState("");
  const [isStartSearching, setIsStartSearching] = useState(false);
  const [startSearchResults, setStartSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [editingStart, setEditingStart] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await googleMapsService.load();
        if (mapRef.current) {
          const map = googleMapsService.initializeMap(mapRef.current);
          mapInstanceRef.current = map;
          googleMapsService.initializeDirectionsServices(map);
          
          // Initialize directions renderer
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#10b981',
              strokeWeight: 5
            }
          });
        }
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    };

    initMap();
  }, []);

  // Load localStorage data when component mounts or when props change
  useEffect(() => {
    if (collectionId && selectedDay !== undefined) {
      const data = loadCollectionFromLocalStorage(collectionId);
      setLocalStorageData(data);
      
      // If we have localStorage data and a selected day, use that data
      if (data && selectedDay !== undefined) {
        const planForDay = data.plans.find((plan: any) => plan.day === selectedDay);
        if (planForDay) {
          // Use saved startLocation, ensuring it's a place and not accommodation
          setStartLocation(planForDay.startLocation || "");
          setTransportation(planForDay.transportation || "");
        }
      }
    }
  }, [collectionId, selectedDay]);

  // Update state when currentPlan prop changes
  useEffect(() => {
    if (currentPlan) {
      setStartLocation(currentPlan.startLocation || "");
      setTransportation(currentPlan.transportation || "");
    }
  }, [currentPlan]);

  const searchPlaces = async (term: string): Promise<google.maps.places.AutocompletePrediction[]> => {
    if (!term.trim()) return [];
    
    try {
      const results = await googleMapsService.searchPlaces(term);
      return results;
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    }
  };

  const handleStartSearch = async () => {
    if (!startSearchTerm.trim()) return;
    
    setIsStartSearching(true);
    try {
      const results = await searchPlaces(startSearchTerm);
      setStartSearchResults(results);
    } catch (error) {
      console.error("Error searching start places:", error);
      setStartSearchResults([]);
    } finally {
      setIsStartSearching(false);
    }
  };

  const handleSelectStartLocation = (description: string) => {
    setStartLocation(description);
    setStartSearchTerm("");
    setStartSearchResults([]);
    setEditingStart(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const geocoder = new google.maps.Geocoder();
            const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                setStartLocation(results[0].formatted_address);
                alert("ตั้งค่าตำแหน่งปัจจุบันเป็นจุดเริ่มต้นแล้ว!");
              } else {
                alert("ไม่สามารถระบุที่อยู่จากตำแหน่งปัจจุบันได้");
              }
            });
          } catch (error) {
            console.error("Error getting current location:", error);
            alert("เกิดข้อผิดพลาดในการดึงตำแหน่งปัจจุบัน");
          }
        },
        (error) => {
          console.error("Error getting current position:", error);
          alert("ไม่สามารถเข้าถึงตำแหน่งปัจจุบันได้ โปรดตรวจสอบการตั้งค่าตำแหน่งในเบราว์เซอร์");
        }
      );
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง");
    }
  };

  const calculateRouteSegments = async () => {
    if (!startLocation.trim() || !currentPlan?.stops || currentPlan.stops.length === 0) {
      setRouteSegments([]);
      return;
    }

    try {
      const segments: RouteSegment[] = [];
      
      // First segment: from start location to first stop
      const firstStop = currentPlan.stops[0];
      try {
        const firstSegment = await calculateSegment(startLocation, firstStop.name, 0);
        segments.push(firstSegment);
      } catch (error) {
        console.error("Error calculating first segment:", error);
        alert(`ไม่สามารถคำนวณเส้นทางจาก "${startLocation}" ไปยัง "${firstStop.name}" ได้`);
        setRouteSegments([]);
        return;
      }
      
      // Subsequent segments: from stop N to stop N+1
      for (let i = 0; i < currentPlan.stops.length - 1; i++) {
        const fromStop = currentPlan.stops[i];
        const toStop = currentPlan.stops[i + 1];
        try {
          const segment = await calculateSegment(fromStop.name, toStop.name, i + 1);
          segments.push(segment);
        } catch (error) {
          console.error(`Error calculating segment ${i + 1}:`, error);
          alert(`ไม่สามารถคำนวณเส้นทางจาก "${fromStop.name}" ไปยัง "${toStop.name}" ได้`);
          // Continue with other segments rather than stopping completely
        }
      }
      
      setRouteSegments(segments);
      
      // Display the first segment on the map initially
      if (segments.length > 0) {
        setActiveSegmentIndex(0);
        displaySegmentOnMap(segments[0]);
      } else {
        setActiveSegmentIndex(-1);
        // Clear map if no segments could be calculated
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections({ routes: [] } as google.maps.DirectionsResult);
        }
      }
    } catch (error) {
      console.error("Error calculating route segments:", error);
      alert("เกิดข้อผิดพลาดในการคำนวณเส้นทางการเดินทาง");
      setRouteSegments([]);
    }
  };

  const calculateSegment = async (from: string, to: string, index: number): Promise<RouteSegment> => {
    return new Promise((resolve, reject) => {
      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          resolve({
            from,
            to,
            distance: leg.distance?.text || "",
            duration: leg.duration?.text || "",
            index
          });
        } else {
          console.error(`Error calculating segment from "${from}" to "${to}":`, status);
          reject(new Error(`ไม่สามารถคำนวณเส้นทางจาก "${from}" ไปยัง "${to}" ได้`));
        }
      });
    });
  };

  const displaySegmentOnMap = async (segment: RouteSegment) => {
    try {
      const directionsService = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: segment.from,
        destination: segment.to,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
          }
          
          // Update active segment index
          setActiveSegmentIndex(segment.index);
          
          // Center map on the route
          if (mapInstanceRef.current && result.routes[0].bounds) {
            // Extend bounds slightly for better visibility
            const bounds = result.routes[0].bounds;
            if (bounds) {
              mapInstanceRef.current.fitBounds(bounds);
              
              // Add a small delay to ensure smooth animation
              setTimeout(() => {
                if (mapInstanceRef.current && bounds) {
                  mapInstanceRef.current.fitBounds(bounds);
                }
              }, 100);
            }
          }
        } else {
          console.error("Error displaying segment on map:", status);
          alert(`ไม่สามารถแสดงเส้นทางจาก "${segment.from}" ไปยัง "${segment.to}" ได้`);
        }
      });
    } catch (error) {
      console.error("Error displaying segment on map:", error);
      alert("เกิดข้อผิดพลาดในการแสดงเส้นทางบนแผนที่");
    }
  };

  const showLocationOnMap = async (location: string) => {
    if (!location || !mapInstanceRef.current) return;
    
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          mapInstanceRef.current?.setCenter(location);
          mapInstanceRef.current?.setZoom(15);
          
          // Clear any existing route
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({ routes: [] } as google.maps.DirectionsResult);
          }
        }
      });
    } catch (error) {
      console.error("Error showing location on map:", error);
    }
  };

  const handleSave = () => {
    if (onUpdateTransportation && currentPlan) {
      // Set end location to the last stop if available
      const endLocation = currentPlan.stops && currentPlan.stops.length > 0
        ? currentPlan.stops[currentPlan.stops.length - 1].name
        : "";

      onUpdateTransportation(startLocation, endLocation, transportation);

      let message = `บันทึกข้อมูลการเดินทางเรียบร้อยแล้ว!\n\n`;
      message += `🚗 วิธีการเดินทาง: ${transportation || "ยังไม่ได้ระบุ"}\n`;
      message += `📍 จุดเริ่มต้น: ${startLocation || "ยังไม่ได้ระบุ"}\n`;
      message += `🏁 จุดสิ้นสุด: ${endLocation || "ยังไม่ได้ระบุ"}\n\n`;

      if (currentPlan.stops && currentPlan.stops.length > 0) {
        message += `📋 เส้นทางผ่านจุดแวะพัก ${currentPlan.stops.length} จุด:\n`;
        currentPlan.stops.forEach((stop, index) => {
          message += `${index + 1}. ${stop.name}\n`;
        });
      } else {
        message += `⚠️ ไม่มีจุดแวะพักในเส้นทาง`;
      }

      alert(message);
    }
  };

  // Calculate route segments when start location or stops change
  useEffect(() => {
    calculateRouteSegments();
  }, [startLocation, currentPlan?.stops]);

  return (
    <div className="space-y-6">
      {/* Transportation Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            🚗 วิธีการเดินทาง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={transportation}
            onChange={(e) => setTransportation(e.target.value)}
            placeholder="ระบุวิธีการเดินทาง (เช่น รถส่วนตัว, รถเมล์, แท็กซี่)"
            className="text-lg p-6"
          />
        </CardContent>
      </Card>

      {/* Start Location - Current Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-500" />
            📍 จุดเริ่มต้น (ตำแหน่งปัจจุบัน หรือ สถานที่)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              💡 หมายเหตุ: จุดเริ่มต้นควรเป็นตำแหน่งปัจจุบันของคุณ หรือสถานที่ที่คุณเลือกจากแท็บ "สถานที่" เท่านั้น 
              ไม่ควรเป็นข้อมูลจากแท็บ "ที่พัก"
            </p>
          </div>
          {editingStart ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ค้นหาสถานที่เริ่มต้น..."
                  value={startSearchTerm}
                  onChange={(e) => setStartSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartSearch()}
                  className="text-lg p-6"
                />
                <Button size="lg" onClick={handleStartSearch} disabled={isStartSearching}>
                  <Search className="w-5 h-5" />
                </Button>
              </div>
              
              {isStartSearching && (
                <p className="text-center text-muted-foreground">กำลังค้นหา...</p>
              )}
              
              {startSearchResults.length > 0 && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {startSearchResults.map((result) => (
                    <div 
                      key={`start-${result.place_id}`}
                      className="p-4 hover:bg-secondary cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      onClick={() => handleSelectStartLocation(result.description)}
                    >
                      <p className="text-base">{result.description}</p>
                      <Plus className="w-5 h-5 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => {
                    setEditingStart(false);
                    setStartSearchTerm("");
                    setStartSearchResults([]);
                  }}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          ) : startLocation ? (
            <div className="space-y-4">
              <p className="text-xl p-4 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                 onClick={() => showLocationOnMap(startLocation)}>
                {startLocation}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setEditingStart(true)}
                  className="flex-1"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  แก้ไขจุดเริ่มต้น
                </Button>
                <Button 
                  variant="khonkaen" 
                  size="lg" 
                  onClick={getCurrentLocation}
                  className="flex-1"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  ใช้ตำแหน่งปัจจุบัน
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setEditingStart(true)}
                className="flex-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มจุดเริ่มต้น
              </Button>
              <Button 
                variant="khonkaen" 
                size="lg" 
                onClick={getCurrentLocation}
                className="flex-1"
              >
                <Navigation className="w-5 h-5 mr-2" />
                ใช้ตำแหน่งปัจจุบัน
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stops Sequence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            🧭 จุดหมายปลายทาง (จุดแวะพักตามลำดับ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPlan?.stops && currentPlan.stops.length > 0 ? (
            <div className="space-y-4">
              {currentPlan.stops.map((stop, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => showLocationOnMap(stop.name)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{stop.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stop.timeStart} - {stop.timeEnd}
                    </p>
                  </div>
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
              ))}
              <p className="text-sm text-muted-foreground text-center mt-4">
                ระบบจะคำนวณเส้นทางจากจุดเริ่มต้น (สถานที่หรือตำแหน่งปัจจุบัน) ไปยังจุดแวะพักตามลำดับที่แสดง
              </p>
              {currentPlan.stops.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
                  <p className="text-green-800 font-medium">
                    🏁 จุดสิ้นสุดจะถูกบันทึกจากจุดแวะพักสุดท้าย: {currentPlan.stops[currentPlan.stops.length - 1].name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                ยังไม่มีจุดแวะพักในวันนี้<br />
                กรุณาเพิ่มจุดแวะพักในแท็บ "สถานที่"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Segments */}
      {routeSegments.length > 0 && (
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Car className="w-5 h-5" />
              🧭 เส้นทางเป็นขั้นตอน (จากจุดเริ่มต้นไปยังจุดแวะพัก)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routeSegments.map((segment, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${activeSegmentIndex === index ? "bg-blue-100 border-blue-500" : "bg-white border-blue-200 hover:bg-blue-50"}`}
                  onClick={() => {
                    setActiveSegmentIndex(index);
                    displaySegmentOnMap(segment);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-blue-800">
                        ขั้นตอนที่ {segment.index + 1}: จาก "{segment.from}" ไปยัง "{segment.to}"
                      </h3>
                      <div className="flex gap-4 mt-2">
                        <p className="text-sm text-blue-700">
                          ⏱️ {segment.duration}
                        </p>
                        <p className="text-sm text-blue-700">
                          📏 {segment.distance}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        displaySegmentOnMap(segment);
                      }}
                    >
                      แสดงแผนที่
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    คลิกที่กล่องนี้เพื่อดูเส้นทางบนแผนที่
                  </p>
                </div>
              ))}
              <p className="text-sm text-blue-700 mt-4 p-3 bg-blue-100 rounded-lg">
                💡 คำแนะนำจาก AI: ระบบจะคำนวณเส้นทางจากจุดเริ่มต้นที่คุณเลือก (ตำแหน่งปัจจุบันหรือสถานที่) ไปยังแต่ละจุดแวะพักตามลำดับ โดยจุดสิ้นสุดจะถูกบันทึกจากจุดแวะพักสุดท้าย
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            🗺️ แผนที่เส้นทาง (จากจุดเริ่มต้นไปยังจุดแวะพัก)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className="h-96 rounded-xl border-2 border-muted"
          />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            แผนที่แสดงเส้นทางจากจุดเริ่มต้นไปยังจุดแวะพักตามลำดับ<br />
            คลิกที่แต่ละขั้นตอนเพื่อดูเส้นทางบนแผนที่
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} variant="khonkaen" size="lg">
          บันทึกข้อมูลการเดินทาง
        </Button>
      </div>
    </div>
  );
};

export default TransportTab;
