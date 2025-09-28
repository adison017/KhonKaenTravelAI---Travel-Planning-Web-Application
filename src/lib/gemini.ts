import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveCollectionToLocalStorage, WeatherData, Activity, Plan, Collection } from './storage';
import { fetchWeatherForecast, WeatherForecast } from './weatherApi';

// Initialize Gemini API with the provided key
const genAI = new GoogleGenerativeAI('AIzaSyDxOtuESZB_IeWBbaB3aljbLV7hDXtGFRY');

// Get the generative model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// System prompt for KhonKaenTravelAI assistant
const SYSTEM_PROMPT = `คุณเป็น AI Assistant สำหรับแอปพลิเคชัน KhonKaenTravelAI ซึ่งเป็นแอปวางแผนการท่องเที่ยวจังหวัดขอนแก่น

หน้าที่ของคุณ:
- ให้คำแนะนำเกี่ยวกับการท่องเที่ยวในจังหวัดขอนแก่น
- ชช่วยวางแผนทริปและกิจกรรม
- แนะนำสถานที่ท่องเที่ยว ร้านอาหาร ที่พัก
- ให้ข้อมูลเกี่ยวกับวัฒนธรรม ประเพณี และอาหารท้องถิ่น
- ตอบคำถามเกี่ยวกับสภาพอากาศและฤดูกาลท่องเที่ยว
- ให้คำแนะนำในการเดินทางและการใช้จ่าย
- สร้างทริปใหม่และบันทึกใน localStorage เมื่อผู้ใช้ขอ

ความสามารถพิเศษในการสร้างทริป:
เมื่อผู้ใช้ขอให้สร้างทริป คุณต้อง:
1. ถามข้อมูลพื้นฐาน: ชื่อทริป, ประเภท (ครอบครัว/เพื่อน/คู่รัก/คนเดียว/นักเรียน), วันที่เริ่ม-สิ้นสุด, งบประมาณ
2. สร้างแผนวันละวันที่มีสถานที่ท่องเที่ยว สถานที่รับประทานอาหาร กิจกรรม ใหม่ทั้งหมด - ห้ามใช้ข้อมูลเดิมหรือ template เดิม
3. คำนวณค่าใช้จ่ายรวม
4. เมื่อพร้อมสร้างทริป จบการตอบด้วย [CREATE_TRIP] เพื่อให้ระบบสร้างทริปอัตโนมัติ
5. หลังจากสร้างทริปแล้ว ระบบจะแจ้งผู้ใช้ว่าทริปถูกสร้างแล้ว

คำสั่งพิเศษ:
- ใช้ [CREATE_TRIP] เมื่อต้องการให้ระบบสร้างทริปทันที
- อย่าพิมพ์ [CREATE_TRIP] ในข้อความที่ผู้ใช้เห็น แต่ใช้เป็นสัญญาณให้ระบบ
- สร้างทริปใหม่ทุกครั้ง - ห้ามใช้ข้อมูล default หรือ template เดิม

โปรดตอบเป็นภาษาไทยเท่านั้น และให้ข้อมูลที่เป็นมิตรและมีประโยชน์
ใช้ emoji ที่เหมาะสมเพื่อทำให้การสนทนาน่าสนใจ`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiChat {
  private chat: any;
  private messages: ChatMessage[] = [];

  constructor() {
    this.initializeChat();
  }

  private initializeChat() {
    this.chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'ฉันเข้าใจแล้ว ฉันจะทำหน้าที่เป็น AI Assistant สำหรับ KhonKaenTravelAI และจะตอบเป็นภาษาไทยเท่านั้น' }],
        },
      ],
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to history
      this.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Send message to Gemini
      const result = await this.chat.sendMessage(message);
      const response = result.response.text();

      // Add assistant response to history
      this.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง';
    }
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clearHistory() {
    this.messages = [];
    this.initializeChat();
  }
}

// Trip creation functions
export const createTrip = async (tripData: {
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  plans: Plan[];
}): Promise<string> => {
  try {
    // Generate unique collection ID
    const collectionId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Fetch real weather data from API
    console.log('Fetching real weather data for trip creation...');
    const weatherForecast = await fetchWeatherForecast(tripData.startDate, tripData.endDate);

    // Convert WeatherForecast[] to WeatherData[] for storage compatibility
    const weatherData: WeatherData[] = weatherForecast.map(forecast => ({
      date: forecast.date,
      temp: forecast.temp,
      condition: forecast.condition,
      humidity: forecast.humidity,
      wind: forecast.wind,
      forecast: forecast.forecast
    }));

    console.log('Weather data loaded:', weatherData.length, 'days');

    // Create collection object
    const collection: Collection = {
      collectionId,
      name: tripData.name,
      category: tripData.category,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budget: tripData.budget,
      weatherData,
      plans: tripData.plans
    };

    // Save to localStorage
    saveCollectionToLocalStorage(collection);

    return collectionId;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw new Error('ไม่สามารถสร้างทริปได้');
  }
};

// Function to create a sample trip for Khon Kaen with AI-generated content
export const createSampleKhonKaenTrip = async (): Promise<string> => {
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Generate unique trip name with timestamp
    const tripId = Math.random().toString(36).substr(2, 9);
    const tripName = `ทริปขอนแก่น ${tripId.slice(0, 4).toUpperCase()}`;

    // Use AI to generate fresh trip content
    const tripPrompt = `สร้างแผนการท่องเที่ยว 3 วันในจังหวัดขอนแก่นใหม่ทั้งหมด ไม่ใช้ข้อมูลเดิมหรือ template เดิม
    ให้สร้างทริปที่ไม่ซ้ำกับทริปอื่นๆ โดยเลือกสถานที่ท่องเที่ยว ร้านอาหาร กิจกรรมใหม่ๆ ในขอนแก่น

    รูปแบบ JSON ที่ต้องการ:
    {
      "name": "${tripName}",
      "category": "ครอบครัว",
      "startDate": "${startDate}",
      "endDate": "${endDate}",
      "budget": 8500,
      "plans": [
        {
          "day": 1,
          "startLocation": "จุดเริ่มต้นใหม่",
          "endLocation": "จุดสิ้นสุดวันที่ 1",
          "transportation": "รูปแบบการเดินทาง",
          "accommodation": "ที่พักใหม่",
          "stops": [
            {
              "name": "สถานที่ท่องเที่ยวใหม่ในขอนแก่น",
              "timeStart": "09:00",
              "timeEnd": "11:00",
              "description": "คำอธิบายกิจกรรม"
            }
          ],
          "activities": [
            {
              "title": "กิจกรรมใหม่ที่ไม่ซ้ำ",
              "date": "${startDate}",
              "timeStart": "14:00",
              "timeEnd": "16:00",
              "description": "รายละเอียดกิจกรรม",
              "cost": 300,
              "type": "ประเภทกิจกรรม",
              "location": "สถานที่จัดกิจกรรม"
            }
          ]
        },
        {
          "day": 2,
          "startLocation": "จุดเริ่มต้นวันที่ 2",
          "endLocation": "จุดสิ้นสุดวันที่ 2",
          "transportation": "รูปแบบการเดินทาง",
          "accommodation": "ที่พักวันที่ 2",
          "stops": [
            {
              "name": "สถานที่ท่องเที่ยววันที่ 2",
              "timeStart": "10:00",
              "timeEnd": "12:00",
              "description": "คำอธิบายกิจกรรมวันที่ 2"
            }
          ],
          "activities": [
            {
              "title": "กิจกรรมวันที่ 2",
              "date": "${endDate}",
              "timeStart": "13:00",
              "timeEnd": "15:00",
              "description": "รายละเอียดกิจกรรมวันที่ 2",
              "cost": 400,
              "type": "ประเภทกิจกรรม",
              "location": "สถานที่จัดกิจกรรมวันที่ 2"
            }
          ]
        }
      ]
    }

    โปรดสร้างทริปที่แตกต่างและน่าสนใจ ให้ใช้สถานที่จริงในขอนแก่น และคำนวณราคาให้สมจริง`;

    console.log('Generating fresh trip content with AI...');
    const response = await generateGeminiResponse(tripPrompt);

    // Parse the AI-generated trip data
    const tripData = JSON.parse(response);

    // Validate and ensure proper structure
    if (!tripData.plans || !Array.isArray(tripData.plans)) {
      throw new Error('Invalid trip data structure from AI');
    }

    return createTrip(tripData);
  } catch (error) {
    console.error('Error generating AI trip:', error);

    // Fallback to basic trip if AI generation fails
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const plans: Plan[] = [
      {
        day: 1,
        startLocation: "ใจกลางเมืองขอนแก่น",
        endLocation: "สวนสาธารณะ",
        transportation: "เดินเท้า",
        accommodation: "โรงแรมในตัวเมือง",
        stops: [
          { name: "สวนสาธารณะศรีมหาโพธิ", timeStart: "09:00", timeEnd: "11:00", description: "เดินชมธรรมชาติและพระพุทธรูป" }
        ],
        activities: [
          {
            title: "ชมสวนสาธารณะ",
            date: startDate,
            timeStart: "09:00",
            timeEnd: "11:00",
            description: "ผ่อนคลายในสวนสาธารณะที่สวยงาม",
            cost: 0,
            type: "ธรรมชาติ",
            location: "สวนสาธารณะศรีมหาโพธิ"
          }
        ]
      }
    ];

    return createTrip({
      name: "ทริปขอนแก่นแบบง่าย",
      category: "ครอบครัว",
      startDate,
      endDate,
      budget: 5000,
      plans
    });
  }
};

// Singleton instance for the chat
let chatInstance: GeminiChat | null = null;

export const getGeminiChat = (): GeminiChat => {
  if (!chatInstance) {
    chatInstance = new GeminiChat();
  }
  return chatInstance;
};

// Simple function for one-off messages without conversation history
export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    return 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง';
  }
};