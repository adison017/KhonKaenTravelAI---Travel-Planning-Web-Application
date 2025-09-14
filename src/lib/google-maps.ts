import { Loader } from "@googlemaps/js-api-loader";

const GOOGLE_MAPS_API_KEY = "AIzaSyBph4Z7Pj0rEq9oe5xGi-8eY24ogZlw3GY";

class GoogleMapsService {
  private loader: Loader;
  private mapInstance: google.maps.Map | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private isLoaded = false;

  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "routes"]
    });
  }

  async load(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      await this.loader.load();
      this.isLoaded = true;
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      throw error;
    }
  }

  initializeMap(mapElement: HTMLElement, options?: google.maps.MapOptions): google.maps.Map {
    if (!this.isLoaded) {
      throw new Error("Google Maps not loaded. Call load() first.");
    }
    
    const defaultOptions: google.maps.MapOptions = {
      center: { lat: 16.4419, lng: 102.8391 }, // Khon Kaen coordinates
      zoom: 12,
      ...options
    };
    
    this.mapInstance = new google.maps.Map(mapElement, defaultOptions);
    return this.mapInstance;
  }

  initializePlacesServices(mapInstance: google.maps.Map): void {
    if (!this.isLoaded) {
      throw new Error("Google Maps not loaded. Call load() first.");
    }
    
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(mapInstance);
  }

  initializeDirectionsServices(mapInstance: google.maps.Map): void {
    if (!this.isLoaded) {
      throw new Error("Google Maps not loaded. Call load() first.");
    }
    
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true
    });
  }

  async searchPlaces(input: string): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.autocompleteService) {
      throw new Error("Autocomplete service not initialized. Call initializePlacesServices() first.");
    }
    
    return new Promise((resolve, reject) => {
      this.autocompleteService.getPlacePredictions(
        {
          input,
          location: new google.maps.LatLng(16.4419, 102.8391), // Khon Kaen
          radius: 50000, // 50km radius
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            reject(new Error(`Places search failed with status: ${status}`));
          }
        }
      );
    });
  }

  async calculateRoute(
    origin: string,
    destination: string,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    if (!this.directionsService) {
      throw new Error("Directions service not initialized. Call initializeDirectionsServices() first.");
    }
    
    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode,
    };

    return new Promise((resolve, reject) => {
      this.directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed with status: ${status}`));
        }
      });
    });
  }

  displayRoute(result: google.maps.DirectionsResult): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections(result);
    }
  }

  getMapInstance(): google.maps.Map | null {
    return this.mapInstance;
  }

  getDirectionsRenderer(): google.maps.DirectionsRenderer | null {
    return this.directionsRenderer;
  }

  async searchNearbyRestaurants(
    location: google.maps.LatLng,
    radius: number = 5000,
    type: string = 'restaurant'
  ): Promise<google.maps.places.PlaceResult[]> {
    if (!this.placesService) {
      throw new Error("Places service not initialized. Call initializePlacesServices() first.");
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius,
        type: type as any,
      };

      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Nearby search failed with status: ${status}`));
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    if (!this.placesService) {
      throw new Error("Places service not initialized. Call initializePlacesServices() first.");
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['name', 'rating', 'price_level', 'opening_hours', 'vicinity', 'geometry', 'photos', 'formatted_phone_number', 'website']
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details request failed with status: ${status}`));
        }
      });
    });
  }
}

// Export a singleton instance
export const googleMapsService = new GoogleMapsService();

