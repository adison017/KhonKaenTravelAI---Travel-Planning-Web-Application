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
 * Search for hotels
 * @param query Search query (e.g., "khon kaen hotel")
 * @returns Array of hotel search results
 */
// Mock hotel data for Khon Kaen (no API calls needed)
const mockKhonKaenHotels: HotelSearchResult[] = [
  {
    dest_id: "191605",
    search_type: "hotel",
    dest_type: "hotel",
    latitude: 16.4322,
    longitude: 102.8236,
    type: "ho",
    lc: "th",
    name: "โรงแรมเกิดมานอน ขอนแก่น",
    nr_hotels: 1,
    cc1: "th",
    country: "Thailand",
    region: "Khon Kaen Province",
    hotels: 1,
    roundtrip: "",
    image_url: "https://cf.bstatic.com/xdata/images/hotel/150x150/617928228.jpg",
    city_name: "Khon Kaen",
    city_ufi: -3249423,
    label: "โรงแรมเกิดมานอน ขอนแก่น, Khon Kaen, Khon Kaen Province, Thailand"
  },
  {
    dest_id: "191606",
    search_type: "hotel",
    dest_type: "hotel",
    latitude: 16.4350,
    longitude: 102.8250,
    type: "ho",
    lc: "th",
    name: "คานาโฮมฮัก ขอนแก่น",
    nr_hotels: 1,
    cc1: "th",
    country: "Thailand",
    region: "Khon Kaen Province",
    hotels: 1,
    roundtrip: "",
    image_url: "https://cf.bstatic.com/xdata/images/hotel/150x150/456795966.jpg",
    city_name: "Ban Tao No",
    city_ufi: -3408211,
    label: "คานาโฮมฮัก ขอนแก่น, Ban Tao No, Khon Kaen Province, Thailand"
  },
  {
    dest_id: "191607",
    search_type: "hotel",
    dest_type: "hotel",
    latitude: 16.4300,
    longitude: 102.8200,
    type: "ho",
    lc: "th",
    name: "อารมย์ดี อพาทเม้นท์ ขอนแก่น",
    nr_hotels: 1,
    cc1: "th",
    country: "Thailand",
    region: "Khon Kaen Province",
    hotels: 1,
    roundtrip: "",
    image_url: "https://cf.bstatic.com/xdata/images/hotel/150x150/422139763.jpg",
    city_name: "Ban Nong Waeng",
    city_ufi: -3405455,
    label: "อารมย์ดี อพาทเม้นท์ ขอนแก่น, Ban Nong Waeng, Khon Kaen Province, Thailand"
  },
  {
    dest_id: "191608",
    search_type: "hotel",
    dest_type: "hotel",
    latitude: 16.4400,
    longitude: 102.8300,
    type: "ho",
    lc: "th",
    name: "DM ขอนแก่น โรงพยาบาลศรีนครินทร์",
    nr_hotels: 1,
    cc1: "th",
    country: "Thailand",
    region: "Khon Kaen Province",
    hotels: 1,
    roundtrip: "",
    image_url: "https://cf.bstatic.com/xdata/images/hotel/150x150/554625233.jpg",
    city_name: "Ban Nong Waeng",
    city_ufi: -3405455,
    label: "DM ขอนแก่น โรงพยาบาลศรีนครินทร์ มข, Ban Nong Waeng, Khon Kaen Province, Thailand"
  },
  {
    dest_id: "191609",
    search_type: "hotel",
    dest_type: "hotel",
    latitude: 16.4280,
    longitude: 102.8220,
    type: "ho",
    lc: "th",
    name: "The Metal เดอะ เมทัล ขอนแก่น",
    nr_hotels: 1,
    cc1: "th",
    country: "Thailand",
    region: "Khon Kaen Province",
    hotels: 1,
    roundtrip: "",
    image_url: "https://cf.bstatic.com/xdata/images/hotel/150x150/613074382.jpg",
    city_name: "Ban Nong Waeng",
    city_ufi: -3405455,
    label: "The Metal เดอะ เมทัล ขอนแก่น, Ban Nong Waeng, Khon Kaen Province, Thailand"
  }
];

export const searchHotelDestinations = async (query: string): Promise<HotelSearchResult[]> => {
  console.log('Searching hotels with query:', query);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock data for Khon Kaen searches
  if (query.toLowerCase().includes('ขอนแก่น') || query.toLowerCase().includes('khon kaen')) {
    console.log(`Found ${mockKhonKaenHotels.length} hotels for Khon Kaen`);
    return mockKhonKaenHotels;
  }

  // Return empty for other searches (no API call limits)
  console.log('No hotels found for query:', query);
  return [];
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
// Mock hotel details data
const mockHotelDetails: { [key: string]: HotelDetails } = {
  "191605": {
    status: true,
    message: "Success",
    timestamp: Date.now(),
    data: {
      hotel_id: 191605,
      hotel_name: "โรงแรมเกิดมานอน ขอนแก่น",
      url: "https://www.booking.com/hotel/th/kertmanon-khonkaen.html",
      hotel_name_trans: "Kert Manon Hotel Khon Kaen",
      review_nr: 245,
      arrival_date: "2025-01-01",
      departure_date: "2025-01-02",
      latitude: 16.4322,
      longitude: 102.8236,
      address: "ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองขอนแก่น",
      city: "Khon Kaen",
      countrycode: "th",
      zip: "40000",
      timezone: "Asia/Bangkok",
      property_highlight_strip: [
        { name: "Free parking", icon_list: [{ icon: "parking_sign" }] },
        { name: "Swimming pool", icon_list: [{ icon: "pool" }] },
        { name: "Restaurant", icon_list: [{ icon: "food" }] },
        { name: "Free WiFi", icon_list: [{ icon: "wifi" }] }
      ],
      facilities_block: {
        facilities: [
          { name: "Free WiFi", icon: "wifi" },
          { name: "Swimming pool", icon: "pool" },
          { name: "Restaurant", icon: "food" },
          { name: "Parking", icon: "parking" },
          { name: "Fitness centre", icon: "fitness" }
        ]
      },
      rooms: {
        "19160501": {
          description: "ห้องพักสไตล์โมเดิร์นพร้อมวิวเมือง ขนาด 28 ตร.ม.",
          photos: [
            { url_max300: "https://cf.bstatic.com/xdata/images/hotel/max300/617928228.jpg", url_original: "https://cf.bstatic.com/xdata/images/hotel/max500/617928228.jpg" },
            { url_max300: "https://cf.bstatic.com/xdata/images/hotel/max300/617928229.jpg", url_original: "https://cf.bstatic.com/xdata/images/hotel/max500/617928229.jpg" }
          ],
          facilities: [
            { name: "Air conditioning" },
            { name: "Private bathroom" },
            { name: "Flat-screen TV" }
          ],
          highlights: [
            { translated_name: "Free WiFi", icon: "wifi" },
            { translated_name: "City view", icon: "city" },
            { translated_name: "Air conditioning", icon: "snowflake" }
          ]
        }
      },
      block: [
        {
          room_name: "Superior Room with City View",
          gross_amount_per_night: { value: 1200, currency: "THB" },
          all_inclusive_amount: { value: 1350, currency: "THB" }
        }
      ]
    }
  },
  "191606": {
    status: true,
    message: "Success",
    timestamp: Date.now(),
    data: {
      hotel_id: 191606,
      hotel_name: "คานาโฮมฮัก ขอนแก่น",
      url: "https://www.booking.com/hotel/th/cana-home-hug-khonkaen.html",
      hotel_name_trans: "Cana Home Hug Khon Kaen",
      review_nr: 89,
      arrival_date: "2025-01-01",
      departure_date: "2025-01-02",
      latitude: 16.4350,
      longitude: 102.8250,
      address: "ถนนศรีจันทร์ ตำบลในเมือง อำเภอเมืองขอนแก่น",
      city: "Khon Kaen",
      countrycode: "th",
      zip: "40000",
      timezone: "Asia/Bangkok",
      property_highlight_strip: [
        { name: "Free WiFi", icon_list: [{ icon: "wifi" }] },
        { name: "Kitchen", icon_list: [{ icon: "kitchen" }] },
        { name: "Garden", icon_list: [{ icon: "garden" }] },
        { name: "BBQ facilities", icon_list: [{ icon: "bbq" }] }
      ],
      facilities_block: {
        facilities: [
          { name: "Free WiFi", icon: "wifi" },
          { name: "Kitchen", icon: "kitchen" },
          { name: "Garden", icon: "garden" },
          { name: "BBQ facilities", icon: "bbq" }
        ]
      },
      rooms: {
        "19160601": {
          description: "ห้องพักพร้อมครัวขนาดใหญ่ เหมาะสำหรับครอบครัว",
          photos: [
            { url_max300: "https://cf.bstatic.com/xdata/images/hotel/max300/456795966.jpg", url_original: "https://cf.bstatic.com/xdata/images/hotel/max500/456795966.jpg" }
          ],
          facilities: [
            { name: "Kitchen" },
            { name: "Washing machine" },
            { name: "Garden view" }
          ],
          highlights: [
            { translated_name: "Free WiFi", icon: "wifi" },
            { translated_name: "Kitchen", icon: "kitchen" },
            { translated_name: "Garden view", icon: "tree" }
          ]
        }
      },
      block: [
        {
          room_name: "Deluxe Family Room",
          gross_amount_per_night: { value: 1800, currency: "THB" },
          all_inclusive_amount: { value: 2000, currency: "THB" }
        }
      ]
    }
  }
};

export const getHotelDetails = async (
  hotelId: string,
  checkinDate?: string,
  checkoutDate?: string,
  adults: number = 1,
  childrenAges?: string,
  roomQty: number = 1
): Promise<HotelDetails | null> => {
  console.log('Getting hotel details for ID:', hotelId);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return mock data
  const hotelDetail = mockHotelDetails[hotelId];
  if (hotelDetail) {
    console.log('Found hotel details for:', hotelDetail.data.hotel_name);
    return hotelDetail;
  }

  // Fallback for unknown hotel IDs
  console.log('No hotel details found for ID:', hotelId);
  return null;
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