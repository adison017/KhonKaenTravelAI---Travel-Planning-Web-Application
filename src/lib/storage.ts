// src/lib/storage.ts
// Utility functions for localStorage operations following the schema

export interface WeatherData {
  date: string;
  temp: number; // Temperature in Celsius
  condition: string;
  humidity: number;
  wind: number;
  forecast: string;
  // Additional detailed weather fields from OpenWeatherMap API
  main?: string;
  description?: string;
  icon?: string;
  pressure?: number;
  visibility?: number;
  feels_like?: number; // Temperature in Celsius
  temp_min?: number; // Temperature in Celsius
  temp_max?: number; // Temperature in Celsius
  clouds?: number;
  dt?: number;
  dt_txt?: string;
}

export interface Activity {
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  cost: number;
  type: string;
  location?: string;
}

export interface Stop {
  name: string;
  timeStart: string;
  timeEnd: string;
  description?: string;
}

export interface Plan {
  day: number;
  startLocation: string; // Should be a place/location or current position, not accommodation
  endLocation: string; // Should be set to the last stop in the stops array
  transportation: string;
  accommodation: string;
  stops: Stop[];
  activities: Activity[];
}

interface Collection {
  collectionId: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  weatherData: WeatherData[];
  plans: Plan[];
}

/**
 * Save collection data to localStorage
 * @param collection The collection data to save
 */
export const saveCollectionToLocalStorage = (collection: Collection): void => {
  try {
    const key = `collection_${collection.collectionId}`;
    localStorage.setItem(key, JSON.stringify(collection));
  } catch (error) {
    console.error("Failed to save collection to localStorage:", error);
  }
};

/**
 * Load collection data from localStorage
 * @param collectionId The ID of the collection to load
 * @returns The collection data or null if not found
 */
export const loadCollectionFromLocalStorage = (collectionId: string): Collection | null => {
  try {
    const key = `collection_${collectionId}`;
    const savedData = localStorage.getItem(key);
    
    if (savedData) {
      return JSON.parse(savedData) as Collection;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to load collection from localStorage:", error);
    return null;
  }
};

/**
 * Remove collection data from localStorage
 * @param collectionId The ID of the collection to remove
 */
export const removeCollectionFromLocalStorage = (collectionId: string): void => {
  try {
    const key = `collection_${collectionId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove collection from localStorage:", error);
  }
};

/**
 * List all collection IDs stored in localStorage
 * @returns Array of collection IDs
 */
export const listCollectionIds = (): string[] => {
  try {
    const collectionIds: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("collection_")) {
        const collectionId = key.replace("collection_", "");
        collectionIds.push(collectionId);
      }
    }
    
    return collectionIds;
  } catch (error) {
    console.error("Failed to list collections from localStorage:", error);
    return [];
  }
};

/**
 * Validate collection data against the schema
 * @param data The data to validate
 * @returns True if valid, false otherwise
 */
export const validateCollectionData = (data: any): data is Collection => {
  if (!data) return false;
  
  // Check required fields
  const requiredFields: (keyof Collection)[] = [
    "collectionId", "name", "category", "startDate", "endDate", "budget", "weatherData", "plans"
  ];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.startDate)) {
    console.error("Invalid startDate format");
    return false;
  }
  
  if (!dateRegex.test(data.endDate)) {
    console.error("Invalid endDate format");
    return false;
  }
  
  // Validate weatherData array
  if (!Array.isArray(data.weatherData)) {
    console.error("weatherData must be an array");
    return false;
  }
  
  // Validate plans array
  if (!Array.isArray(data.plans)) {
    console.error("plans must be an array");
    return false;
  }
  
  return true;
};