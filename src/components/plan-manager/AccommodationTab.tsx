import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Hotel, Search, Star, MapPin, Wifi, Car, Utensils, Waves, X } from "lucide-react";
import { loadCollectionFromLocalStorage } from "@/lib/storage";
import { searchHotelDestinations, getHotelDetails, getHotelSummary, HotelSearchResult, HotelDetails } from "@/lib/bookingApi";

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
  const isUserInputRef = useRef(false);

  const [accommodation, setAccommodation] = useState(() => {
    isUserInputRef.current = false; // Initial load from props
    return currentPlan?.accommodation || "";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<HotelSearchResult[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [selectedHotelCard, setSelectedHotelCard] = useState<HotelSearchResult | null>(null);

  // Load localStorage data when component mounts
  useEffect(() => {
    if (collectionId && selectedDay) {
      const data = loadCollectionFromLocalStorage(collectionId);
      setLocalStorageData(data);

      // If we have localStorage data and a selected day, use that data
      if (data && selectedDay) {
        const planForDay = data.plans.find((plan: any) => plan.day === selectedDay);
        if (planForDay) {
          isUserInputRef.current = false; // This is from localStorage, not user input
          setAccommodation(planForDay.accommodation || "");
        }
      }
    }
  }, [collectionId, selectedDay]);

  // Update accommodation when currentPlan changes (from day selection)
  useEffect(() => {
    if (currentPlan?.accommodation !== accommodation) {
      isUserInputRef.current = false; // This is from props, not user input
      setAccommodation(currentPlan?.accommodation || "");
    }
  }, [currentPlan?.accommodation]);

  // Update the parent component when accommodation changes (only for user input)
  useEffect(() => {
    if (onUpdateAccommodation && isUserInputRef.current) {
      onUpdateAccommodation(accommodation);
      isUserInputRef.current = false; // Reset the flag
    }
  }, [accommodation, onUpdateAccommodation]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedHotel(null);
    setSelectedHotelCard(null); // Clear selected hotel card

    try {
      const results = await searchHotelDestinations(searchTerm + " ขอนแก่น");
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching hotels:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHotel = (hotel: HotelSearchResult) => {
    console.log("Selecting hotel:", hotel);
    setSelectedHotelCard(hotel);
    setSearchResults([]); // Hide search results
    setSearchTerm(""); // Clear search term
  };

  const handleViewHotelDetails = async () => {
    if (!selectedHotelCard) return;

    setIsLoadingDetails(true);

    try {
      // Try with the selected hotel first
      // Use current date and tomorrow for check-in/out
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const checkinDate = today.toISOString().split('T')[0];
      const checkoutDate = tomorrow.toISOString().split('T')[0];

      console.log("Fetching details for hotel ID:", selectedHotelCard.dest_id);
      console.log("Hotel name:", selectedHotelCard.name);
      console.log("Dates:", checkinDate, "to", checkoutDate);

      let details = await getHotelDetails(selectedHotelCard.dest_id, checkinDate, checkoutDate, 1, '', 1);

      // If that fails, try with a known working hotel ID for testing
      if (!details) {
        console.log("Trying with test hotel ID: 191605");
        details = await getHotelDetails('191605', checkinDate, checkoutDate, 1, '', 1);
      }
      console.log("Hotel details received:", details);
      console.log("Details status:", details?.status);
      console.log("Details message:", details?.message);

      // Always show modal, even with minimal data
      const hotelData = details || {
        status: true,
        message: "Success",
        timestamp: Date.now(),
        data: {
          hotel_id: parseInt(selectedHotelCard.dest_id),
          hotel_name: selectedHotelCard.name,
          address: selectedHotelCard.label,
          city: selectedHotelCard.city_name,
          countrycode: "TH",
          facilities_block: { facilities: [] },
          rooms: {},
          block: []
        }
      };

      setSelectedHotel(hotelData as any);
      setShowHotelModal(true);
      console.log("Modal should open now");

    } catch (error) {
      console.error("Error getting hotel details:", error);
      // Still show modal with basic info
      setSelectedHotel({
        status: true,
        message: "Success",
        timestamp: Date.now(),
        data: {
          hotel_id: parseInt(selectedHotelCard.dest_id),
          hotel_name: selectedHotelCard.name,
          address: selectedHotelCard.label,
          city: selectedHotelCard.city_name,
          countrycode: "TH",
          facilities_block: { facilities: [] },
          rooms: {},
          block: []
        }
      } as any);
      setShowHotelModal(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleConfirmHotel = (hotelName: string) => {
    isUserInputRef.current = true;
    setAccommodation(hotelName);
    setSelectedHotel(null);
    setShowHotelModal(false);
  };

  const handleCloseModal = () => {
    setSelectedHotel(null);
    setShowHotelModal(false);
  };

  const getFacilityIcon = (facilityName: string) => {
    const name = facilityName.toLowerCase();
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (name.includes('parking') || name.includes('car')) return <Car className="w-4 h-4" />;
    if (name.includes('restaurant') || name.includes('food')) return <Utensils className="w-4 h-4" />;
    if (name.includes('pool') || name.includes('swimming')) return <Waves className="w-4 h-4" />;
    return <Hotel className="w-4 h-4" />;
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="w-5 h-5" />
          🏨 ค้นหาที่พักในขอนแก่น
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

          {/* Selected Accommodation Display */}
          {accommodation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">ที่พักที่เลือก:</p>
                  <p className="text-green-700">{accommodation}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    isUserInputRef.current = true;
                    setAccommodation("");
                  }}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  เปลี่ยน
                </Button>
              </div>
            </div>
          )}

          {/* LocalStorage Data Display */}
          {localStorageData && selectedDay && (
            <div className="text-xs text-muted-foreground mb-2">
              แสดงข้อมูลจาก LocalStorage: {localStorageData.name} (Day {selectedDay})
            </div>
          )}

          {/* Hotel Search Section */}
          {!accommodation && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="ค้นหาที่พักในขอนแก่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                  <Search className="w-4 h-4" />
                  {isSearching ? "ค้นหา..." : "ค้นหา"}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ผลการค้นหาที่พัก</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {searchResults.map((hotel) => (
                          <div
                            key={hotel.dest_id}
                            className={`p-3 border rounded-lg hover:bg-secondary cursor-pointer transition-colors ${
                              isLoadingDetails ? 'opacity-50 pointer-events-none' : ''
                            }`}
                            onClick={() => handleSelectHotel(hotel)}
                          >
                            <div className="flex items-start gap-3">
                              {hotel.image_url && (
                                <img
                                  src={hotel.image_url}
                                  alt={hotel.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2">{hotel.name}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {hotel.city_name}, {hotel.country}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {hotel.region}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Selected Hotel Card */}
              {selectedHotelCard && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-green-600" />
                      ที่พักที่เลือก
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-4">
                      {selectedHotelCard.image_url && (
                        <img
                          src={selectedHotelCard.image_url}
                          alt={selectedHotelCard.name}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-green-800">{selectedHotelCard.name}</h3>
                        <p className="text-sm text-green-700 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4" />
                          {selectedHotelCard.city_name}, {selectedHotelCard.country}
                        </p>
                        {selectedHotelCard.region && (
                          <p className="text-sm text-green-600 mt-1">{selectedHotelCard.region}</p>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={handleViewHotelDetails}
                            disabled={isLoadingDetails}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {isLoadingDetails ? "กำลังโหลด..." : "ดูรายละเอียด"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedHotelCard(null)}
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            ยกเลิก
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Input Fallback */}
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  หรือระบุชื่อที่พักเอง:
                </label>
                <Input
                  value={accommodation}
                  onChange={(e) => {
                    isUserInputRef.current = true;
                    setAccommodation(e.target.value);
                  }}
                  placeholder="ระบุชื่อที่พักด้วยตัวเอง"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 คำแนะนำ: จองที่พักในเขตตัวเมืองจะสะดวกต่อการเดินทาง
              และเดินทางไปยังสถานที่ท่องเที่ยวต่างๆ ในขอนแก่นได้ง่าย
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Hotel Details Modal */}
    <Dialog open={showHotelModal} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              รายละเอียดที่พัก
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseModal}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>


        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลดรายละเอียดที่พัก...</p>
            </div>
          </div>
        ) : selectedHotel && (
          <div className="space-y-6">
            {/* Hotel Basic Info */}
            <div>
              <h2 className="text-2xl font-bold">{selectedHotel.data.hotel_name}</h2>
              <p className="text-muted-foreground flex items-center gap-1 mt-2">
                <MapPin className="w-4 h-4" />
                {selectedHotel.data.address}, {selectedHotel.data.city}, {selectedHotel.data.countrycode}
              </p>
              {selectedHotel.data.review_nr > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">({selectedHotel.data.review_nr} รีวิว)</span>
                </div>
              )}
            </div>

            {/* Hotel Images Gallery */}
            {(() => {
              const firstRoom = Object.values(selectedHotel.data.rooms)[0] as any;
              const photos = firstRoom?.photos || [];
              if (photos.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <img
                      src={photos[0].url_max300}
                      alt={selectedHotel.data.hotel_name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {photos.length > 1 && (
                      <div className="grid grid-cols-2 gap-2">
                        {photos.slice(1, 5).map((photo: any, index: number) => (
                          <img
                            key={index}
                            src={photo.url_max300}
                            alt={`${selectedHotel.data.hotel_name} ${index + 2}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* Price Information */}
            {selectedHotel.data.block && selectedHotel.data.block.length > 0 && selectedHotel.data.block[0] && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">💰 ราคาและนโยบาย</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {(selectedHotel.data as any).block[0].gross_amount_per_night?.value ? (
                      <p className="text-2xl font-bold text-green-700">
                        ฿{(selectedHotel.data as any).block[0].gross_amount_per_night.value.toLocaleString()} ต่อคืน
                      </p>
                    ) : (
                      <p className="text-lg text-green-700">ราคาไม่ระบุ</p>
                    )}
                    <p className="text-sm text-green-600 mt-1">ราคารวมภาษีและค่าธรรมเนียม</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">จำนวนห้องว่าง: {(selectedHotel.data as any).available_rooms || 'N/A'}</p>
                    <p className="text-sm">จำนวนผู้เข้าพักสูงสุด: {(selectedHotel.data as any).block[0].max_occupancy || 'N/A'}</p>
                  </div>
                </div>

                {/* Cancellation Policy */}
                {(selectedHotel.data as any).block[0].paymentterms?.cancellation && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-sm font-medium text-green-800">นโยบายการยกเลิก:</p>
                    <p className="text-xs text-green-700 mt-1">
                      {(selectedHotel.data as any).block[0].paymentterms.cancellation.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {(() => {
              const firstRoom = Object.values(selectedHotel.data.rooms)[0] as any;
              return firstRoom?.description ? (
                <div>
                  <h3 className="font-semibold mb-3">📝 คำอธิบาย</h3>
                  <p className="text-muted-foreground leading-relaxed">{firstRoom.description}</p>
                </div>
              ) : null;
            })()}

            {/* Facilities */}
            {selectedHotel.data.facilities_block?.facilities && (
              <div>
                <h3 className="font-semibold mb-3">🏨 สิ่งอำนวยความสะดวก</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.data.facilities_block.facilities.map((facility, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
                      {getFacilityIcon(facility.name)}
                      <span className="ml-1">{facility.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Room Highlights */}
            {(() => {
              const firstRoom = Object.values(selectedHotel.data.rooms)[0] as any;
              return firstRoom?.highlights ? (
                <div>
                  <h3 className="font-semibold mb-3">✨ จุดเด่นของห้อง</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {firstRoom.highlights.map((highlight: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <span className="text-green-600 text-lg">✓</span>
                        {highlight.translated_name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleConfirmHotel(selectedHotel.data.hotel_name)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                🏨 เลือกโรงแรมนี้
              </Button>
              {selectedHotel.data.url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedHotel.data.url, '_blank')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                  size="lg"
                >
                  🌐 ดูที่ Booking.com
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
                size="lg"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AccommodationTab;
