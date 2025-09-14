import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Star, Clock, DollarSign, Phone, Navigation } from "lucide-react";
import { googleMapsService } from "@/lib/google-maps";

interface Restaurant {
  place_id: string;
  name: string;
  description: string;
  rating?: number;
  price_level?: number;
  opening_hours?: string;
  phone?: string;
  vicinity?: string;
  distance?: number;
  photos?: string[];
}

const RestaurantSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const categories = [
    "ทั้งหมด",
    "อาหารไทย",
    "อาหารอีสาน",
    "ก๋วยเตี๋ยว",
    "ข้าวผัด",
    "ส้มตำ",
    "ปิ้งย่าง",
    "ของหวาน",
    "เครื่องดื่ม",
    "ฟาสต์ฟู้ด"
  ];

  useEffect(() => {
    const initMap = async () => {
      try {
        await googleMapsService.load();
        
        // Get user's current location
        const getUserLocation = (): Promise<{lat: number, lng: number}> => {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                resolve(pos);
              },
              () => {
                // Default to Khon Kaen if geolocation fails
                const defaultPos = { lat: 16.4322, lng: 102.8236 };
                resolve(defaultPos);
              }
            );
          });
        };
        
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

    const initializeEverything = async () => {
      await initMap();
      
      // Load recommended restaurants after map is initialized
      loadRecommendedRestaurants();
    };
    
    initializeEverything();
  }, []);

  // Clear existing markers
  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  // Show directions to restaurant with multiple fallback methods
  const showDirections = async (restaurant: Restaurant) => {
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
      // Method 1: Try with place_id if it's a real Google place_id
      if (restaurant.place_id && !restaurant.place_id.startsWith('restaurant_')) {
        const request = {
          placeId: restaurant.place_id,
          fields: ['geometry', 'name', 'formatted_address']
        };

        const service = new google.maps.places.PlacesService(map!);
        
        const placeResult = await new Promise<google.maps.places.PlaceResult | null>((resolve) => {
          service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
              resolve(place);
            } else {
              resolve(null);
            }
          });
        });

        if (placeResult?.geometry?.location) {
          // Try DRIVING first
          const drivingSuccess = await tryDirections(placeResult.geometry.location, google.maps.TravelMode.DRIVING);
          if (drivingSuccess) return;
          
          // Try WALKING as fallback
          const walkingSuccess = await tryDirections(placeResult.geometry.location, google.maps.TravelMode.WALKING);
          if (walkingSuccess) return;
        }
      }

      // Method 2: Try with restaurant name as text search
      const textSearchSuccess = await tryDirections(restaurant.name + ', ขอนแก่น', google.maps.TravelMode.DRIVING);
      if (textSearchSuccess) return;
      
      // Method 3: Try with restaurant name + vicinity
      if (restaurant.vicinity) {
        const vicinitySearchSuccess = await tryDirections(restaurant.name + ', ' + restaurant.vicinity, google.maps.TravelMode.DRIVING);
        if (vicinitySearchSuccess) return;
      }
      
      // Method 4: Try walking mode with text search
      const walkingTextSuccess = await tryDirections(restaurant.name + ', ขอนแก่น', google.maps.TravelMode.WALKING);
      if (walkingTextSuccess) return;
      
      // Method 5: Open Google Maps as final fallback
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(restaurant.name + ', ขอนแก่น')}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
      
    } catch (error) {
      console.error('Error showing directions:', error);
      // Final fallback - open Google Maps
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(restaurant.name + ', ขอนแก่น')}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Add markers to map
  const addMarkersToMap = async (restaurantList: Restaurant[]) => {
    if (!map) return;
    
    clearMarkers();
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    for (const restaurant of restaurantList) {
      try {
        // Get place details to get coordinates
        const request = {
          placeId: restaurant.place_id,
          fields: ['geometry', 'name', 'formatted_address', 'rating', 'price_level']
        };

        const service = new google.maps.places.PlacesService(map);
        
        await new Promise<void>((resolve) => {
          service.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
              const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: restaurant.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#ff6b35" stroke="white" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🍽️</text>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(32, 32)
                }
              });

              // Create info window
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; font-family: 'Sarabun', sans-serif;">
                    <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">
                      🍽️ ${restaurant.name}
                    </h3>
                    <p style="margin: 4px 0; color: #666; font-size: 14px;">
                      📍 ${place.formatted_address || restaurant.vicinity}
                    </p>
                    ${restaurant.rating ? `
                      <p style="margin: 4px 0; color: #666; font-size: 14px;">
                        ⭐ ${restaurant.rating.toFixed(1)} คะแนน
                      </p>
                    ` : ''}
                    ${restaurant.price_level ? `
                      <p style="margin: 4px 0; color: #666; font-size: 14px;">
                        💰 ${getPriceDisplay(restaurant.price_level)}
                      </p>
                    ` : ''}
                    <p style="margin: 8px 0 4px 0; color: #666; font-size: 14px;">
                      🕒 ${restaurant.opening_hours}
                    </p>
                  </div>
                `
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });

              newMarkers.push(marker);
              bounds.extend(place.geometry.location);
            }
            resolve();
          });
        });
      } catch (error) {
        console.error('Error adding marker for restaurant:', restaurant.name, error);
      }
    }

    setMarkers(newMarkers);
    
    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      // Set a maximum zoom level
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  };

  const loadRecommendedRestaurants = async () => {
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
      
      // Use Google Places Nearby Search to get real restaurant data
      const location = new google.maps.LatLng(userLocation.lat, userLocation.lng);
      const radius = 5000; // 5km radius
      
      let allResults: google.maps.places.PlaceResult[] = [];
      
      if (selectedCategory === "ทั้งหมด") {
        // Search for restaurants in general
        console.log('Searching for all restaurants nearby');
        try {
          const results = await googleMapsService.searchNearbyRestaurants(location, radius, 'restaurant');
          allResults = results || [];
        } catch (error) {
          console.log('Error searching for restaurants:', error);
          allResults = [];
        }
      } else {
        // For specific categories, still use nearby search but we'll filter later
        console.log('Searching for restaurants, category:', selectedCategory);
        try {
          const results = await googleMapsService.searchNearbyRestaurants(location, radius, 'restaurant');
          allResults = results || [];
        } catch (error) {
          console.log(`Error searching for ${selectedCategory}:`, error);
          allResults = [];
        }
      }
      
      // Check if we have any results
      if (!allResults || allResults.length === 0) {
        setRestaurants([]);
        clearMarkers();
        setIsSearching(false);
        return;
      }
      
      // Get detailed information for each restaurant
      const restaurantResults: Restaurant[] = [];
      
      for (const result of allResults.slice(0, 20)) { // Limit to 20 results to avoid too many API calls
        try {
          let detailedPlace = result;
          
          // Get more details if we have a place_id
          if (result.place_id) {
            try {
              detailedPlace = await googleMapsService.getPlaceDetails(result.place_id);
            } catch (error) {
              console.log('Could not get details for place:', result.name);
              // Use the basic result if detailed fetch fails
            }
          }
          
          // Calculate real distance using coordinates
          let distance = 0;
          if (detailedPlace.geometry?.location) {
            const restaurantLat = typeof detailedPlace.geometry.location.lat === 'function' 
              ? detailedPlace.geometry.location.lat() 
              : detailedPlace.geometry.location.lat;
            const restaurantLng = typeof detailedPlace.geometry.location.lng === 'function' 
              ? detailedPlace.geometry.location.lng() 
              : detailedPlace.geometry.location.lng;
            
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in kilometers
            const dLat = (Number(restaurantLat) - userLocation.lat) * Math.PI / 180;
            const dLng = (Number(restaurantLng) - userLocation.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(Number(restaurantLat) * Math.PI / 180) *
                     Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = R * c;
          }
          
          // Get photos from Google Places API
          let photos: string[] = [];
          if (detailedPlace.photos && detailedPlace.photos.length > 0) {
            photos = detailedPlace.photos.slice(0, 5).map(photo => {
              return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
            });
          }

          // Add all restaurants, create fallback place_id if needed
          const restaurant: Restaurant = {
             place_id: detailedPlace.place_id || `restaurant_${Date.now()}_${Math.random()}`,
             name: detailedPlace.name || 'ร้านอาหาร',
             description: detailedPlace.vicinity || detailedPlace.formatted_address || 'ร้านอาหารในขอนแก่น',
             rating: detailedPlace.rating || undefined,
             price_level: detailedPlace.price_level || undefined,
             opening_hours: detailedPlace.opening_hours?.isOpen() !== undefined 
               ? (detailedPlace.opening_hours.isOpen() ? 'เปิดอยู่' : 'ปิดแล้ว')
               : undefined,
             phone: detailedPlace.formatted_phone_number || undefined,
             vicinity: detailedPlace.vicinity || detailedPlace.formatted_address || 'ขอนแก่น',
             distance: distance,
             photos: photos
           };
           
           restaurantResults.push(restaurant);
           
           if (!detailedPlace.place_id) {
             console.log('Added restaurant without place_id with fallback ID:', detailedPlace.name);
           }
         } catch (error) {
           console.log('Error processing restaurant:', error);
         }
       }
       
       // Filter restaurants within 5km
       const filteredRestaurants = restaurantResults.filter(r => (r.distance || 0) <= 5);
       
       // Sort by distance (nearest first) and take the results
       const finalRestaurants = filteredRestaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
       
       setRestaurants(finalRestaurants);
      
       // Add markers to map
       await addMarkersToMap(finalRestaurants);
    } catch (error) {
      console.error("Error loading recommended restaurants:", error);
      setRestaurants([]);
      clearMarkers();
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchQuery = query || searchTerm;
    if (!searchQuery.trim()) {
      loadRecommendedRestaurants();
      return;
    }
    
    if (!userLocation) return;
    
    setIsSearching(true);
    try {
      // Use text search with user's query
      const location = new google.maps.LatLng(userLocation.lat, userLocation.lng);
      const radius = 10000; // 10km radius for search
      
      let allResults: google.maps.places.PlaceResult[] = [];
      
      // Search for restaurants matching the query
      console.log('Searching for:', searchQuery);
      try {
        const results = await googleMapsService.searchNearbyRestaurants(location, radius, 'restaurant');
        // Filter results by name or vicinity that contains the search query
        const filteredResults = results.filter(result => 
          result.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.vicinity?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        allResults = filteredResults || [];
      } catch (error) {
        console.log('Error searching for restaurants:', error);
        allResults = [];
      }
      
      // Check if we have any results
      if (!allResults || allResults.length === 0) {
        console.log('No restaurants found for the search query');
        setRestaurants([]);
        clearMarkers();
        setIsSearching(false);
        return;
      }
      
      // Get detailed information for each restaurant
      const restaurantResults: Restaurant[] = [];
      
      for (const result of allResults.slice(0, 15)) { // Limit to 15 results
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
            const restaurantLat = typeof detailedPlace.geometry.location.lat === 'function' 
              ? detailedPlace.geometry.location.lat() 
              : detailedPlace.geometry.location.lat;
            const restaurantLng = typeof detailedPlace.geometry.location.lng === 'function' 
              ? detailedPlace.geometry.location.lng() 
              : detailedPlace.geometry.location.lng;
            
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in kilometers
            const dLat = (Number(restaurantLat) - userLocation.lat) * Math.PI / 180;
            const dLng = (Number(restaurantLng) - userLocation.lng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                     Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(Number(restaurantLat) * Math.PI / 180) *
                     Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            distance = R * c;
          }
          
          // Get photos from Google Places API
          let photos: string[] = [];
          if (detailedPlace.photos && detailedPlace.photos.length > 0) {
            photos = detailedPlace.photos.slice(0, 5).map(photo => {
              return photo.getUrl({ maxWidth: 400, maxHeight: 300 });
            });
          }

          // Add all restaurants, create fallback place_id if needed
          const restaurant: Restaurant = {
            place_id: detailedPlace.place_id || `restaurant_${Date.now()}_${Math.random()}`,
            name: detailedPlace.name || 'ร้านอาหาร',
            description: detailedPlace.vicinity || detailedPlace.formatted_address || 'ร้านอาหารในขอนแก่น',
            rating: detailedPlace.rating || undefined,
            price_level: detailedPlace.price_level || undefined,
            opening_hours: detailedPlace.opening_hours?.isOpen() !== undefined 
              ? (detailedPlace.opening_hours.isOpen() ? 'เปิดอยู่' : 'ปิดแล้ว')
              : undefined,
            phone: detailedPlace.formatted_phone_number || undefined,
            vicinity: detailedPlace.vicinity || detailedPlace.formatted_address || 'ขอนแก่น',
            distance: distance,
            photos: photos
          };
          
          restaurantResults.push(restaurant);
          
          if (!detailedPlace.place_id) {
            console.log('Added restaurant without place_id with fallback ID:', detailedPlace.name);
          }
        } catch (error) {
          console.log('Error processing restaurant:', error);
        }
      }
      
      // Filter restaurants within 10km and sort by distance
      const filteredRestaurants = restaurantResults.filter(r => (r.distance || 0) <= 10);
      const sortedRestaurants = filteredRestaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setRestaurants(sortedRestaurants);
      
      // Add markers to map
      await addMarkersToMap(sortedRestaurants);
    } catch (error) {
      console.error("Error searching restaurants:", error);
      setRestaurants([]);
      clearMarkers();
    } finally {
      setIsSearching(false);
    }
  };

  const getPriceDisplay = (level: number) => {
    return "฿".repeat(level) + "฿".repeat(4 - level).replace(/฿/g, "○");
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return "★".repeat(fullStars) + (hasHalfStar ? "☆" : "") + "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
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
                <span className="text-3xl animate-float">🍜</span>
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-kanit">ร้านอาหารใกล้ฉัน</h1>
                  <p className="text-xs text-muted-foreground font-sarabun">ค้นหาร้านอาหารอร่อยในขอนแก่น</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="container mx-auto px-4 py-8">
        <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-kanit">
              <Search className="w-5 h-5 text-khonkaen-primary" />
              ค้นหาร้านอาหาร
            </CardTitle>
            <CardDescription className="font-sarabun">
              ค้นหาร้านอาหารที่คุณต้องการในขอนแก่น
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder="ค้นหาร้านอาหาร เมนู หรือชื่อร้าน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="font-sarabun"
              />
              <Button 
                onClick={() => handleSearch()} 
                disabled={isSearching}
                className="font-prompt"
              >
                <Search className="w-4 h-4" />
                {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium font-sarabun">หมวดหมู่:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      if (searchTerm) {
                        handleSearch();
                      } else {
                        loadRecommendedRestaurants();
                      }
                    }}
                    className="font-prompt text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-kanit">
              <MapPin className="w-5 h-5 text-khonkaen-primary" />
              แผนที่ร้านอาหาร
            </CardTitle>
            <CardDescription className="font-sarabun">
              คลิกที่ marker เพื่อดูรายละเอียดร้านอาหาร
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div 
              ref={mapRef} 
              className="h-80 rounded-lg border"
            />
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground font-kanit flex items-center gap-2">
            🍽️ {searchTerm ? 'ผลการค้นหา' : 'ร้านอาหารแนะนำ'}
            {selectedCategory !== "ทั้งหมด" && (
              <span className="text-sm font-normal text-khonkaen-primary">({selectedCategory})</span>
            )}
            <span className="text-sm font-normal text-muted-foreground">({restaurants.length} ร้าน)</span>
            {!searchTerm && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-normal">
                เรียงตามระยะทางใกล้ที่สุด
              </span>
            )}
          </h3>

          {isSearching ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 animate-spin">🔍</div>
              <p className="text-muted-foreground font-sarabun">กำลังค้นหาร้านอาหาร...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant, index) => (
                <Card 
                  key={restaurant.place_id} 
                  className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border/50 bg-white/80 backdrop-blur-sm animate-fade-in cursor-pointer border-l-4 border-l-orange-500"
                  style={{ animationDelay: `${0.1 * index}s` }}
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setShowDetails(true);
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg font-kanit text-gray-800">
                      🍽️ {restaurant.name}
                    </CardTitle>
                    <CardDescription className="text-sm font-sarabun line-clamp-2">
                      {restaurant.vicinity}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {restaurant.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                          <span className="font-prompt font-medium">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {restaurant.price_level && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="font-prompt text-orange-600 font-medium">
                          {getPriceDisplay(restaurant.price_level)}
                        </span>
                      </div>
                    )}
                    
                    {restaurant.opening_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-prompt px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {restaurant.opening_hours}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {restaurant.distance && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-prompt">ระยะทาง {restaurant.distance.toFixed(1)} กม.</span>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full font-prompt bg-orange-500 hover:bg-orange-600 text-white border-orange-500 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRestaurant(restaurant);
                          setShowDetails(true);
                        }}
                      >
                        <Star className="w-4 h-4" />
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
                  ? `ไม่พบร้านอาหาร${selectedCategory}ในบริเวณนี้` 
                  : "ไม่พบร้านอาหาร"
                }
              </h3>
              <p className="text-muted-foreground font-sarabun mb-6">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่</p>
              <div className="flex gap-2 justify-center">
                {selectedCategory !== "ทั้งหมด" && (
                  <Button 
                    onClick={() => {
                      setSelectedCategory("ทั้งหมด");
                      loadRecommendedRestaurants();
                    }}
                    variant="outline"
                    className="font-prompt"
                  >
                    ดูร้านอาหารทั้งหมด
                  </Button>
                )}
                <Button 
                  variant="hero" 
                  onClick={() => loadRecommendedRestaurants()}
                  className="font-prompt"
                >
                  <Search className="w-4 h-4" />
                  ดูร้านอาหารแนะนำ
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
                <div className="text-3xl mb-2">🌶️</div>
                <h4 className="font-semibold font-kanit text-foreground">อาหารอีสาน</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  ส้มตำ ลาบ ก้อย และอาหารพื้นเมืองขอนแก่น
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🍜</div>
                <h4 className="font-semibold font-kanit text-foreground">ก๋วยเตี๋ยว</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  ก๋วยเตี๋ยวเรือ บะหมี่ และเส้นใหญ่ผัดซีอิ๊ว
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl mb-2">🧊</div>
                <h4 className="font-semibold font-kanit text-foreground">เครื่องดื่ม</h4>
                <p className="text-sm text-muted-foreground font-sarabun">
                  ชาไทย กาแฟโบราณ และน้ำผลไม้สด
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Restaurant Details Modal */}
      {showDetails && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-kanit">
                  🍽️ {selectedRestaurant.name}
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
                {selectedRestaurant.vicinity}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Restaurant Photos */}
              {selectedRestaurant.photos && selectedRestaurant.photos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold font-kanit text-lg">รูปภาพร้าน</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRestaurant.photos.map((photo, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                        <img 
                          src={photo} 
                          alt={`${selectedRestaurant.name} - รูปที่ ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Restaurant Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedRestaurant.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                    <span className="font-prompt font-medium">
                      {selectedRestaurant.rating.toFixed(1)} คะแนน
                    </span>
                  </div>
                )}
                
                {selectedRestaurant.price_level && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    <span className="font-prompt text-orange-600 font-medium">
                      {getPriceDisplay(selectedRestaurant.price_level)}
                    </span>
                  </div>
                )}
                
                {selectedRestaurant.opening_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="font-prompt text-green-700 font-medium">
                      {selectedRestaurant.opening_hours}
                    </span>
                  </div>
                )}
                
                {selectedRestaurant.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-prompt text-blue-700 font-medium">
                      ระยะทาง {selectedRestaurant.distance.toFixed(1)} กม.
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold font-kanit text-lg">รายละเอียด</h4>
                <p className="text-gray-600 font-sarabun leading-relaxed">
                  {selectedRestaurant.description || 'ร้านอาหารคุณภาพดีในขอนแก่น เสิร์ฟอาหารอร่อยด้วยวัตถุดิบสดใหม่ บรรยากาศดี เหมาะสำหรับทุกโอกาส'}
                </p>
              </div>
              
              {/* Additional Info */}
              <div className="space-y-2">
                <h4 className="font-semibold font-kanit text-lg">ข้อมูลเพิ่มเติม</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 font-sarabun">
                  {selectedRestaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>โทร: {selectedRestaurant.phone}</span>
                    </div>
                  )}
                  {selectedRestaurant.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedRestaurant.opening_hours}</span>
                    </div>
                  )}
                  {selectedRestaurant.vicinity && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedRestaurant.vicinity}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => showDirections(selectedRestaurant)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-prompt flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  ขอเส้นทาง
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (selectedRestaurant.phone) {
                      window.open(`tel:${selectedRestaurant.phone}`, '_self');
                    } else {
                      alert('ไม่มีเบอร์โทรศัพท์ของร้านนี้');
                    }
                  }}
                  className="flex-1 font-prompt flex items-center gap-2"
                  disabled={!selectedRestaurant.phone}
                >
                  <Phone className="w-4 h-4" />
                  โทรหาร้าน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RestaurantSearch;