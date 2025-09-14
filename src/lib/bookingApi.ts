import axios from 'axios';

const RAPIDAPI_KEY = '554d58f9camsh3e8d343e5db1ccep163327jsn553f0f626807';
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';

// Types for Booking.com API responses
export interface HotelSearchResult {
  dest_id: string;
  search_type: string;
  dest_type: string;
  latitude: number;
  longitude: number;
  type: string;
  lc: string;
  name: string;
  nr_hotels: number;
  cc1: string;
  country: string;
  region: string;
  hotels: number;
  roundtrip: string;
  image_url: string;
  city_name: string;
  city_ufi: number;
  label: string;
}

export interface HotelDetails {
  status: boolean;
  message: string;
  timestamp: number;
  data: {
    hotel_id: number;
    hotel_name: string;
    url: string;
    hotel_name_trans: string;
    review_nr: number;
    arrival_date: string;
    departure_date: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    countrycode: string;
    zip: string;
    timezone: string;
    facilities_block: {
      facilities: Array<{
        name: string;
        icon: string;
      }>;
    };
    property_highlight_strip: Array<{
      name: string;
      icon_list: Array<{
        icon: string;
      }>;
    }>;
    rooms: {
      [roomId: string]: {
        description: string;
        photos: Array<{
          url_max300: string;
          url_original: string;
        }>;
        facilities: Array<{
          name: string;
        }>;
        highlights: Array<{
          translated_name: string;
          icon: string;
        }>;
      };
    };
    block: Array<{
      room_name: string;
      gross_amount_per_night: {
        value: number;
        currency: string;
      };
      all_inclusive_amount: {
        value: number;
        currency: string;
      };
    }>;
  };
}

/**
 * Search for hotel destinations
 * @param query Search query (e.g., "khon kaen hotel")
 * @returns Array of hotel search results
 */
export const searchHotelDestinations = async (query: string): Promise<HotelSearchResult[]> => {
  try {
    const response = await axios.get('https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination', {
      params: { query },
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error searching hotel destinations:', error);
    return [];
  }
};

/**
 * Get detailed information about a specific hotel
 * @param hotelId The hotel ID from search results
 * @param checkinDate Check-in date (YYYY-MM-DD)
 * @param checkoutDate Check-out date (YYYY-MM-DD)
 * @param adults Number of adults
 * @param childrenAges Array of children ages
 * @param roomQty Number of rooms
 * @returns Detailed hotel information
 */
export const getHotelDetails = async (
  hotelId: string,
  checkinDate: string = '2025-01-01',
  checkoutDate: string = '2025-01-02',
  adults: number = 1,
  childrenAges: string = '',
  roomQty: number = 1
): Promise<HotelDetails | null> => {
  try {
    const params: any = {
      hotel_id: hotelId,
      adults,
      room_qty: roomQty,
      units: 'metric',
      temperature_unit: 'c',
      languagecode: 'en-us',
      currency_code: 'THB'
    };

    if (childrenAges) {
      params.children_age = childrenAges;
    }

    const response = await axios.get('https://booking-com15.p.rapidapi.com/api/v1/hotels/getHotelDetails', {
      params,
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (response.data.status) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error getting hotel details:', error);
    return null;
  }
};

/**
 * Get a simplified hotel summary for display
 */
export const getHotelSummary = (hotel: HotelDetails): {
  id: number;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  facilities: string[];
  imageUrl?: string;
  description?: string;
} => {
  const data = hotel.data;
  const facilities = data.facilities_block?.facilities?.slice(0, 5).map(f => f.name) || [];
  const firstRoom = Object.values(data.rooms)[0] as any;
  const firstBlock = data.block?.[0];

  return {
    id: data.hotel_id,
    name: data.hotel_name,
    address: `${data.address}, ${data.city}, ${data.countrycode}`,
    reviewCount: data.review_nr,
    facilities,
    imageUrl: firstRoom?.photos?.[0]?.url_max300,
    description: firstRoom?.description,
    priceRange: firstBlock ? `฿${firstBlock.gross_amount_per_night.value} ต่อคืน` : undefined
  };
};