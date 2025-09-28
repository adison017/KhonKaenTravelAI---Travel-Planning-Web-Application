// src/lib/lazadaApi.ts
const RAPIDAPI_KEY = '554d58f9camsh3e8d343e5db1ccep163327jsn553f0f626807';
const RAPIDAPI_HOST = 'lazada-api.p.rapidapi.com';

export interface LazadaProduct {
  item_id: string;
  product_url: string;
  title: string;
  img: string;
  category_path: number[];
  brand: string;
  brand_id: string;
  currency: string;
  price: string;
  price_info: {
    sale_price: string;
    origin_price: string;
  };
  discount: string | null;
  review_info: {
    average_score: string;
    review_count: number;
  };
  comment_count: number;
  shop_info: {
    shop_id: string | null;
    shop_name: string;
    shop_url: string;
    seller_id: string;
    seller_name: string;
  };
  sold_count: number | null;
  delivery_info: {
    area_from: string;
  };
  is_in_stock: boolean;
  is_ad: boolean;
}

export interface LazadaSearchResult {
  code: number;
  msg: string;
  data: {
    page: number;
    page_size: number;
    start_key: string;
    total_count: number;
    keyword: string;
    cat_url: string;
    sort: string;
    price_start: string;
    price_end: string;
    items: LazadaProduct[];
  };
}

/**
 * Search products on Lazada
 * @param keywords Search keywords
 * @param page Page number (default: 1)
 * @param sort Sort option (pop, price_asc, price_desc)
 * @returns Search results
 */
export const searchLazadaProducts = async (
  keywords: string,
  page: number = 1,
  sort: 'pop' | 'price_asc' | 'price_desc' = 'pop'
): Promise<LazadaSearchResult> => {
  try {
    const url = `https://lazada-api.p.rapidapi.com/lazada/search/items`;

    console.log(`Searching Lazada products for: ${keywords}`);

    const params = new URLSearchParams({
      keywords: keywords,
      site: 'th', // Thailand site - most relevant for Khon Kaen tourism
      page: page.toString(),
      sort: sort
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    console.log(`Lazada API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lazada API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`Lazada API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Lazada API response data:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error searching Lazada products:', error);
    throw new Error('ไม่สามารถค้นหาสินค้าใน Lazada ได้');
  }
};

/**
 * Generate AI-powered product recommendations for Khon Kaen
 * @returns Array of product search keywords
 */
export const generateKhonKaenProductIdeas = async (): Promise<string[]> => {
  try {
    const { generateGeminiResponse } = await import('./gemini');

    const prompt = `สร้างรายชื่อสินค้าที่เกี่ยวข้องกับการท่องเที่ยว ที่เหมาะสำหรับนักท่องเที่ยวไปขอนแก่น
ให้เป็นสินค้าที่สามารถหาซื้อได้บนแพลตฟอร์ม Lazada ทั่วไป (ไม่จำเป็นต้องระบุขอนแก่นในชื่อสินค้า แต่ควรเป็นสินค้าที่นักท่องเที่ยวขอนแก่นต้องการ)

ให้คำตอบเป็น JSON array ของ keywords สำหรับการค้นหา เช่น:
["อุปกรณ์เดินทาง", "รองเท้าเดินป่า", "หมวกกันแดด", "กระเป๋าเดินทาง", "เสื้อกันฝน"]

เน้นสินค้าที่เกี่ยวข้องกับการท่องเที่ยว เช่น:
- อุปกรณ์เดินทางและเดินป่า (backpack, hiking boots, water bottle)
- เครื่องแต่งกายสำหรับการเดินทาง (sun hat, rain jacket, trekking pants)
- อุปกรณ์ความปลอดภัย (insect repellent, first aid kit, sunscreen)
- ของใช้ในการตั้งแคมป์และปิคนิก (folding chair, cooler bag, portable grill)
- สินค้าที่ระลึกและงานฝีมือ (local handicrafts, souvenirs)

ให้ 8-10 keywords และใช้ภาษาไทย สินค้าควรเป็นสินค้าที่มีขายจริงใน Lazada`;

    const response = await generateGeminiResponse(prompt);
    const keywords = JSON.parse(response);

    // Validate that we got an array
    if (!Array.isArray(keywords)) {
      throw new Error('Invalid response format');
    }

    return keywords.slice(0, 10); // Limit to 10 keywords
  } catch (error) {
    console.error('Error generating product ideas:', error);
    // Return fallback keywords
    return [
      "อุปกรณ์เดินทาง",
      "รองเท้าเดินป่า",
      "หมวกกันแดด",
      "กระเป๋าเดินทาง",
      "เสื้อกันฝน",
      "ครีมกันแดด",
      "ขวดน้ำเดินทาง",
      "อุปกรณ์ปิคนิก"
    ];
  }
};