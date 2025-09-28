import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Star, Clock, Camera, Phone, Navigation } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";

interface TouristAttraction {
  place_id: string;
  name: string;
  description: string;
  rating?: number;
  opening_hours?: string;
  phone?: string;
  vicinity?: string;
  distance?: number;
  photos?: string[];
  types?: string[];
}

const TouristAttractionSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<TouristAttraction | null>(null);
  const [showDetails, setShowDetails] = useState(false);


  const categories = [
    "ทั้งหมด",
    "วัด",
    "พิพิธภัณฑ์",
    "สวนสาธารณะ",
    "ตลาด",
    "ห้างสรรพสินค้า",
    "สถานที่ท่องเที่ยว",
    "ธรรมชาติ",
    "ประวัติศาสตร์",
    "ศิลปะ"
  ];

  // Get user's current location
  const getUserLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to Khon Kaen city center
            resolve({ lat: 16.4322, lng: 102.8236 });
          }
        );
      } else {
        // Default to Khon Kaen city center
        resolve({ lat: 16.4322, lng: 102.8236 });
      }
    });
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Load Google Maps first
        await googleMapsService.load();
        
        const userPos = await getUserLocation();
        setUserLocation(userPos);
        
        if (mapRef.current) {
          const mapInstance = googleMapsService.initializeMap(mapRef.current, { center: userPos, zoom: 15 });
          googleMapsService.initializePlacesServices(mapInstance);
          setMap(mapInstance);
          
          // Initialize directions service and renderer
          const dirService = new google.maps.DirectionsService();
          const dirRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#FF6B35',
              strokeWeight: 4
            }
          });
          
          setDirectionsService(dirService);
          setDirectionsRenderer(dirRenderer);
          dirRenderer.setMap(mapInstance);
        }
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
      }
    };

    initializeMap();
    loadRecommendedAttractions();
  }, []);

  useEffect(() => {
    loadRecommendedAttractions();
  }, [selectedCategory]);

  // Show directions to attraction with multiple fallback methods
  const showDirections = async (attraction: TouristAttraction) => {
    if (!userLocation || !directionsService || !directionsRenderer) {
      alert('ไม่สามารถแสดงเส้นทางได้ กรุณาตรวจสอบตำแหน่งของคุณ');
      return;
    }

    const tryDirections = (destination: google.maps.LatLng | string, travelMode: google.maps.TravelMode) => {
      return new Promise<boolean>((resolve) => {
        const directionsRequest = {
          origin: userLocation,
          destination: destination,
          travelMode: travelMode
        };
        
        directionsService.route(directionsRequest, (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            // Show success message and close details modal
            alert('ขอเส้นทางสำเร็จ! เส้นทางแสดงบนแผนที่แล้ว');
            setShowDetails(false);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    };

    try {
      // Method 1: Try with place_id if available
      if (attraction.place_id && attraction.place_id.startsWith('ChIJ')) {
        const placeIdSuccess = await tryDirections(attraction.place_id, google.maps.TravelMode.DRIVING);
        if (placeIdSuccess) return;
      }
      
      // Method 2: Try with attraction name + Khon Kaen
      const textSearchSuccess = await tryDirections(attraction.name + ', ขอนแก่น', google.maps.TravelMode.DRIVING);
      if (textSearchSuccess) return;
      
      // Method 3: Try with attraction name + vicinity
      if (attraction.vicinity) {
        const vicinitySearchSuccess = await tryDirections(attraction.name + ', ' + attraction.vicinity, google.maps.TravelMode.DRIVING);
        if (vicinitySearchSuccess) return;
      }
      
      // Method 4: Try walking mode with text search
      const walkingTextSuccess = await tryDirections(attraction.name + ', ขอนแก่น', google.maps.TravelMode.WALKING);
      if (walkingTextSuccess) return;
      
      // Method 5: Open Google Maps as final fallback
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(attraction.name + ', ขอนแก่น')}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
      
    } catch (error) {
      console.error('Error showing directions:', error);
      // Final fallback - open Google Maps
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(attraction.name + ', ขอนแก่น')}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Clear existing markers
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  // Add markers to map
  const addMarkersToMap = async (attractionList: TouristAttraction[]) => {
    if (!map) return;
    
    clearMarkers();
    const newMarkers: google.maps.Marker[] = [];
    
    for (const attraction of attractionList) {
      try {
        if (attraction.place_id && attraction.place_id.startsWith('ChIJ')) {
          const placeDetails = await googleMapsService.getPlaceDetails(attraction.place_id);
          if (placeDetails.geometry?.location) {
            const marker = new google.maps.Marker({
              position: placeDetails.geometry.location,
              map: map,
              title: attraction.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">📍</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
              }
            });
            
            marker.addListener('click', () => {
              setSelectedAttraction(attraction);
              setShowDetails(true);
            });
            
            newMarkers.push(marker);
          }
        }
      } catch (error) {
        console.log('Could not add marker for:', attraction.name);
      }
    }
    
    setMarkers(newMarkers);
  };

  const loadRecommendedAttractions = async () => {
    if (!userLocation) {
      return;
    }

    setIsSearching(true);
    try {
      // Check if Google Maps is loaded
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded');
        setIsSearching(false);
        return;
      }

      const location = new google.maps.LatLng(userLocation.lat, userLocation.lng);

      let searchQuery = 'สถานที่ท่องเที่ยว ขอนแก่น';

      if (selectedCategory !== "ทั้งหมด") {
        // Map Thai categories to search keywords
        const categoryKeywords: { [key: string]: string } = {
          "วัด": "วัด ขอนแก่น temple",
          "พิพิธภัณฑ์": "พิพิธภัณฑ์ ขอนแก่น museum",
          "สวนสาธารณะ": "สวนสาธารณะ ขอนแก่น park garden",
          "ตลาด": "ตลาด ขอนแก่น market",
          "ห้างสรรพสินค้า": "ห้างสรรพสินค้า ขอนแก่น mall shopping",
          "สถานที่ท่องเที่ยว": "สถานที่ท่องเที่ยว ขอนแก่น attraction",
          "ธรรมชาติ": "ธรรมชาติ ขอนแก่น nature",
          "ประวัติศาสตร์": "ประวัติศาสตร์ ขอนแก่น historical landmark",
          "ศิลปะ": "ศิลปะ ขอนแก่น art gallery"
        };

        searchQuery = categoryKeywords[selectedCategory] || searchQuery;
      }

      console.log('Loading recommended attractions for category:', selectedCategory, 'with query:', searchQuery);

      // Use text search for better results
      const results = await googleMapsService.textSearchPlaces(searchQuery, location, 30000);

      if (!results || results.length === 0) {
        console.log('No results found for category:', selectedCategory);
        setAttractions([]);
        clearMarkers();
        setIsSearching(false);
        return;
      }

      // Get detailed information for each attraction
      const attractionResults: TouristAttraction[] = [];

      for (const result of results.slice(0, 20)) { // Limit to 20 results
        try {
          let detailedPlace = result;

          // Get more details if we have a place_id
          if (result.place_id) {
            try {
              detailedPlace = await googleMapsService.getPlaceDetails(result.place_id);
            } catch (error) {
              console.log('Could not get details for place:', result.name);
            }
          }

          // Calculate real distance using coordinates
          let distance = 0;
          if (detailedPlace.geometry?.location) {
            const attractionLat = typeof detailedPlace.geometry.location.lat === 'function'
              ? detailedPlace.geometry.location.lat()
              : detailedPlace.geometry.location.lat;
            const attractionLng = typeof detailedPlace.geometry.location.lng === 'function'
              ? detailedPlace.geometry.location.lng()
              : detailedPlace.geometry.location.lng;

            distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              attractionLat as number, attractionLng as number
            );
          }

          // Get photos from Google Places API
          let photos: string[] = [];
          if (detailedPlace.photos && detailedPlace.photos.length > 0) {
            photos = detailedPlace.photos.slice(0, 5).map(photo => {
              return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
            });
          }

          // Create attraction object
          const attraction: TouristAttraction = {
            place_id: detailedPlace.place_id || `attraction_${Date.now()}_${Math.random()}`,
            name: detailedPlace.name || 'สถานที่ท่องเที่ยว',
            description: detailedPlace.vicinity || detailedPlace.formatted_address || 'สถานที่ท่องเที่ยวในขอนแก่น',
            rating: detailedPlace.rating || undefined,
            opening_hours: detailedPlace.opening_hours?.isOpen() !== undefined
              ? (detailedPlace.opening_hours.isOpen() ? 'เปิดอยู่' : 'ปิดแล้ว')
              : undefined,
            phone: detailedPlace.formatted_phone_number || undefined,
            vicinity: detailedPlace.vicinity || detailedPlace.formatted_address || 'ขอนแก่น',
            distance: distance,
            photos: photos,
            types: detailedPlace.types || []
          };

          attractionResults.push(attraction);

          if (!detailedPlace.place_id) {
            console.log('Added attraction without place_id with fallback ID:', detailedPlace.name);
          }
        } catch (error) {
          console.log('Error processing attraction:', error);
        }
      }

      // Filter attractions within 30km and with relevant categories
      const filteredAttractions = attractionResults.filter(a => {
        const withinDistance = (a.distance || 0) <= 30;

        // Additional filtering based on category
        if (selectedCategory !== "ทั้งหมด") {
          const types = a.types || [];
          let categoryMatch = false;

          switch (selectedCategory) {
            case "วัด":
              categoryMatch = types.includes('place_of_worship') ||
                             types.includes('church') ||
                             types.includes('hindu_temple') ||
                             a.name?.toLowerCase().includes('วัด');
              break;
            case "พิพิธภัณฑ์":
              categoryMatch = types.includes('museum') ||
                             a.name?.toLowerCase().includes('museum') ||
                             a.name?.toLowerCase().includes('พิพิธ');
              break;
            case "สวนสาธารณะ":
              categoryMatch = types.includes('park') ||
                             a.name?.toLowerCase().includes('park') ||
                             a.name?.toLowerCase().includes('สวน');
              break;
            case "ตลาด":
              categoryMatch = types.includes('shopping_mall') ||
                             a.name?.toLowerCase().includes('ตลาด') ||
                             a.name?.toLowerCase().includes('market');
              break;
            case "ห้างสรรพสินค้า":
              categoryMatch = types.includes('shopping_mall') ||
                             a.name?.toLowerCase().includes('ห้าง') ||
                             a.name?.toLowerCase().includes('mall');
              break;
            case "สถานที่ท่องเที่ยว":
              categoryMatch = types.includes('tourist_attraction') ||
                             types.includes('historical_landmark');
              break;
            case "ธรรมชาติ":
              categoryMatch = types.includes('park') ||
                             types.includes('natural_feature') ||
                             a.name?.toLowerCase().includes('ธรรมชาติ');
              break;
            case "ประวัติศาสตร์":
              categoryMatch = types.includes('historical_landmark') ||
                             a.name?.toLowerCase().includes('ประวัติ');
              break;
            case "ศิลปะ":
              categoryMatch = types.includes('art_gallery') ||
                             a.name?.toLowerCase().includes('ศิลป');
              break;
            default:
              categoryMatch = true;
          }

          return withinDistance && categoryMatch;
        }

        return withinDistance;
      });

      // Sort by relevance (rating + photos) then distance
      const finalAttractions = filteredAttractions.sort((a, b) => {
        const aScore = (a.rating || 0) + (a.photos?.length || 0) * 0.5;
        const bScore = (b.rating || 0) + (b.photos?.length || 0) * 0.5;
        return bScore - aScore || (a.distance || 0) - (b.distance || 0);
      });

      console.log(`Loaded ${finalAttractions.length} attractions for category: ${selectedCategory}`);
      setAttractions(finalAttractions);

      // Add markers to map
      await addMarkersToMap(finalAttractions);
    } catch (error) {
      console.error("Error loading recommended attractions:", error);
      setAttractions([]);
      clearMarkers();
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || !userLocation) return;

    setIsSearching(true);
    try {
      console.log('Searching for:', searchTerm + ' ขอนแก่น');

      // Use text search for user queries
      const location = new google.maps.LatLng(userLocation.lat, userLocation.lng);
      const query = searchTerm.trim() + ' ขอนแก่น สถานที่ท่องเที่ยว';
      const results = await googleMapsService.textSearchPlaces(query, location, 50000);

      console.log('Search results:', results);

      if (!results || results.length === 0) {
        setAttractions([]);
        clearMarkers();
        setIsSearching(false);
        return;
      }

      const attractionResults: TouristAttraction[] = [];

      for (const result of results.slice(0, 20)) {
        try {
          let detailedPlace = result;

          // Get more details if we have a place_id
          if (result.place_id) {
            try {
              detailedPlace = await googleMapsService.getPlaceDetails(result.place_id);
            } catch (error) {
              console.log('Could not get details for place:', result.name);
            }
          }

          let distance = 0;
          if (detailedPlace.geometry?.location) {
            const attractionLat = typeof detailedPlace.geometry.location.lat === 'function'
              ? detailedPlace.geometry.location.lat()
              : detailedPlace.geometry.location.lat;
            const attractionLng = typeof detailedPlace.geometry.location.lng === 'function'
              ? detailedPlace.geometry.location.lng()
              : detailedPlace.geometry.location.lng;

            distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              attractionLat as number, attractionLng as number
            );
          }

          // Get photos from Google Places API
          let photos: string[] = [];
          if (detailedPlace.photos && detailedPlace.photos.length > 0) {
            photos = detailedPlace.photos.slice(0, 5).map(photo => {
              return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
            });
          }

          // Check if it's actually a tourist attraction (filter out restaurants, etc.)
          const types = detailedPlace.types || [];
          const isTouristAttraction =
            types.includes('tourist_attraction') ||
            types.includes('museum') ||
            types.includes('park') ||
            types.includes('place_of_worship') ||
            types.includes('church') ||
            types.includes('hindu_temple') ||
            types.includes('historical_landmark') ||
            types.includes('art_gallery') ||
            result.name?.toLowerCase().includes('วัด') ||
            result.name?.toLowerCase().includes('museum') ||
            result.name?.toLowerCase().includes('park');

          if (isTouristAttraction) {
            const attraction: TouristAttraction = {
              place_id: detailedPlace.place_id || `attraction_${Date.now()}_${Math.random()}`,
              name: detailedPlace.name || 'สถานที่ท่องเที่ยว',
              description: detailedPlace.vicinity || detailedPlace.formatted_address || 'สถานที่ท่องเที่ยวในขอนแก่น',
              rating: detailedPlace.rating || undefined,
              opening_hours: detailedPlace.opening_hours?.isOpen() !== undefined
                ? (detailedPlace.opening_hours.isOpen() ? 'เปิดอยู่' : 'ปิดแล้ว')
                : undefined,
              phone: detailedPlace.formatted_phone_number || undefined,
              vicinity: detailedPlace.vicinity || detailedPlace.formatted_address || 'ขอนแก่น',
              distance: distance,
              photos: photos,
              types: detailedPlace.types || []
            };

            attractionResults.push(attraction);

            if (!detailedPlace.place_id) {
              console.log('Added attraction without place_id with fallback ID:', detailedPlace.name);
            }
          }
        } catch (error) {
          console.log('Error processing attraction:', error);
        }
      }

      // Sort by distance and relevance
      const sortedAttractions = attractionResults.sort((a, b) => {
        // Prioritize attractions with ratings and photos
        const aScore = (a.rating || 0) + (a.photos?.length || 0) * 0.5;
        const bScore = (b.rating || 0) + (b.photos?.length || 0) * 0.5;
        return bScore - aScore || (a.distance || 0) - (b.distance || 0);
      });

      // Use only API results, no fallback mock data
      const finalAttractions = sortedAttractions;

      console.log('Final attractions:', finalAttractions.length, 'items');
      setAttractions(finalAttractions);

      // Add markers to map
      await addMarkersToMap(finalAttractions);
    } catch (error) {
      console.error("Error searching attractions:", error);
      setAttractions([]);
      clearMarkers();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-khonkaen-secondary/30 to-khonkaen-nature/10 font-thai">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="hover:scale-105 transition-transform"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3 animate-fade-in">
                <span className="text-3xl animate-float">📍</span>
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-kanit">สถานที่ท่องเที่ยวใกล้ฉัน</h1>
                  <p className="text-xs text-muted-foreground font-sarabun">ค้นหาสถานที่ท่องเที่ยวน่าสนใจในขอนแก่น</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="ค้นหาสถานที่ท่องเที่ยว เช่น วัด พิพิธภัณฑ์ สวนสาธารณะ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="font-sarabun"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchTerm.trim()}
                className="font-prompt bg-khonkaen-nature hover:bg-khonkaen-nature/90"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer font-prompt transition-all ${
                    selectedCategory === category 
                      ? 'bg-khonkaen-nature hover:bg-khonkaen-nature/90' 
                      : 'hover:bg-khonkaen-nature/10'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div ref={mapRef} className="w-full h-96 rounded-lg" />
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {isSearching ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-spin">🔄</div>
              <h3 className="text-2xl font-bold text-foreground font-kanit mb-2">กำลังค้นหาสถานที่ท่องเที่ยว</h3>
              <p className="text-muted-foreground font-sarabun">กรุณารอสักครู่...</p>
            </div>
          ) : attractions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction, index) => (
                <Card 
                  key={attraction.place_id} 
                  className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in cursor-pointer border-l-4 border-l-green-500"
                  style={{ animationDelay: `${0.1 * index}s` }}
                  onClick={() => {
                    setSelectedAttraction(attraction);
                    setShowDetails(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-kanit text-gray-800">
                      📍 {attraction.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-sarabun line-clamp-2">
                      {attraction.vicinity}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {attraction.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                          <span className="font-prompt font-medium">
                            {attraction.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {attraction.opening_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-prompt px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {attraction.opening_hours}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {attraction.distance && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-prompt">ระยะทาง {attraction.distance.toFixed(1)} กม.</span>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full font-prompt bg-green-500 hover:bg-green-600 text-white border-green-500 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAttraction(attraction);
                          setShowDetails(true);
                        }}
                      >
                        <Camera className="w-4 h-4" />
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <h3 className="text-2xl font-bold text-foreground font-kanit mb-2">
                {selectedCategory !== "ทั้งหมด" 
                  ? `ไม่พบสถานที่ท่องเที่ยว${selectedCategory}ในบริเวณนี้` 
                  : "ไม่พบสถานที่ท่องเที่ยว"
                }
              </h3>
              <p className="text-muted-foreground font-sarabun mb-6">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่</p>
              <div className="flex gap-2 justify-center">
                {selectedCategory !== "ทั้งหมด" && (
                  <Button 
                    onClick={() => {
                      setSelectedCategory("ทั้งหมด");
                      loadRecommendedAttractions();
                    }}
                    variant="outline"
                    className="font-prompt"
                  >
                    ดูสถานที่ท่องเที่ยวทั้งหมด
                  </Button>
                )}
                <Button 
                  variant="hero" 
                  onClick={() => loadRecommendedAttractions()}
                  className="font-prompt"
                >
                  <Search className="w-4 h-4" />
                  ดูสถานที่ท่องเที่ยวแนะนำ
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-khonkaen-secondary/30 via-white/50 to-khonkaen-nature/20 border-khonkaen-primary/20 shadow-lg backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl mb-2">🏛️</div>
                <h4 className="font-semibold font-kanit text-foreground">วัดและประวัติศาสตร์</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  ขอนแก่นมีวัดและสถานที่ทางประวัติศาสตร์มากมาย
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🌳</div>
                <h4 className="font-semibold font-kanit text-foreground">ธรรมชาติ</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  สวนสาธารณะและแหล่งท่องเที่ยวธรรมชาติ
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-semibold font-kanit text-foreground">ศิลปะและวัฒนธรรม</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  พิพิธภัณฑ์และแหล่งเรียนรู้วัฒนธรรมท้องถิ่น
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Attraction Details Modal */}
      {showDetails && selectedAttraction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl font-kanit">
                  📍 {selectedAttraction.name}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDetails(false)}
                  className="hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
              <CardDescription className="font-sarabun">
                {selectedAttraction.vicinity}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Attraction Photos */}
              {selectedAttraction.photos && selectedAttraction.photos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold font-kanit text-lg">รูปภาพสถานที่</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedAttraction.photos.map((photo, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                        <img 
                          src={photo} 
                          alt={`${selectedAttraction.name} - รูปที่ ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Attraction Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedAttraction.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    <span className="font-prompt font-medium">
                      {selectedAttraction.rating.toFixed(1)} คะแนน
                    </span>
                  </div>
                )}
                
                {selectedAttraction.opening_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="font-prompt text-green-700 font-medium">
                      {selectedAttraction.opening_hours}
                    </span>
                  </div>
                )}
                
                {selectedAttraction.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-prompt text-blue-700 font-medium">
                      ระยะทาง {selectedAttraction.distance.toFixed(1)} กม.
                    </span>
                  </div>
                )}
              </div>
              
              {/* Additional Info */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold font-kanit">ข้อมูลเพิ่มเติม</h4>
                <div className="space-y-2 text-sm text-muted-foreground font-sarabun">
                  {selectedAttraction.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>โทร: {selectedAttraction.phone}</span>
                    </div>
                  )}
                  {selectedAttraction.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedAttraction.opening_hours}</span>
                    </div>
                  )}
                  {selectedAttraction.vicinity && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedAttraction.vicinity}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => showDirections(selectedAttraction)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-prompt flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  ขอเส้นทาง
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (selectedAttraction.phone) {
                      window.open(`tel:${selectedAttraction.phone}`, '_self');
                    } else {
                      alert('ไม่มีเบอร์โทรศัพท์ของสถานที่นี้');
                    }
                  }}
                  className="flex-1 font-prompt flex items-center gap-2"
                  disabled={!selectedAttraction.phone}
                >
                  <Phone className="w-4 h-4" />
                  โทรสอบถาม
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TouristAttractionSearch;