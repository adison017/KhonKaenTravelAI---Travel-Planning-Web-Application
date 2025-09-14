import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveCollectionToLocalStorage, WeatherData, Activity, Plan, Collection } from './storage';

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
2. สร้างแผนวันละวันที่มีสถานที่ท่องเที่ยว สถานที่รับประทานอาหาร กิจกรรม
3. คำนวณค่าใช้จ่ายรวม
4. เมื่อพร้อมสร้างทริป จบการตอบด้วย [CREATE_TRIP] เพื่อให้ระบบสร้างทริปอัตโนมัติ
5. หลังจากสร้างทริปแล้ว ระบบจะแจ้งผู้ใช้ว่าทริปถูกสร้างแล้ว

คำสั่งพิเศษ:
- ใช้ [CREATE_TRIP] เมื่อต้องการให้ระบบสร้างทริปทันที
- อย่าพิมพ์ [CREATE_TRIP] ในข้อความที่ผู้ใช้เห็น แต่ใช้เป็นสัญญาณให้ระบบ

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
export const createTrip = (tripData: {
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  plans: Plan[];
}): string => {
  try {
    // Generate unique collection ID
    const collectionId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create weather data (placeholder - would be fetched from API in real app)
    const weatherData: WeatherData[] = [];
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < Math.min(daysDiff, 5); i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weatherData.push({
        date: date.toISOString().split('T')[0],
        temp: 30 + Math.floor(Math.random() * 8), // Random temp between 30-37°C
        condition: ["แดดจัด", "เมฆบางส่วน", "มีฝนเล็กน้อย"][Math.floor(Math.random() * 3)],
        humidity: 60 + Math.floor(Math.random() * 25),
        wind: 5 + Math.floor(Math.random() * 10),
        forecast: "เหมาะสำหรับการท่องเที่ยว"
      });
    }

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

// Function to create a sample trip for Khon Kaen
export const createSampleKhonKaenTrip = (): string => {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const plans: Plan[] = [
    {
      day: 1,
      startLocation: "บ้านพักในตัวเมืองขอนแก่น",
      endLocation: "ตลาดทุ่งสร้าง",
      transportation: "เดินเท้า/รถจักรยานยนต์",
      accommodation: "โรงแรมในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
      stops: [
        { name: "หอศิลปวัฒนธรรมแห่งจังหวัดขอนแก่น", timeStart: "09:00", timeEnd: "10:30", description: "ชมนิทรรศการศิลปะพื้นบ้าน" },
        { name: "ตลาดทุ่งสร้าง", timeStart: "11:00", timeEnd: "12:30", description: "ชิมอาหารพื้นบ้านและเลือกซื้อของฝาก" }
      ],
      activities: [
        {
          title: "เยี่ยมชมสวนสาธารณะศรีมหาโพธิ",
          date: startDate,
          timeStart: "08:00",
          timeEnd: "10:00",
          description: "เดินเล่นรับลมเย็น ชมพระพุทธรูปใหญ่และทะเลสาบ",
          cost: 0,
          type: "ธรรมชาติ",
          location: "สวนสาธารณะศรีมหาโพธิ"
        }
      ]
    },
    {
      day: 2,
      startLocation: "ตลาดทุ่งสร้าง",
      endLocation: "วัดพระธาตุขามแก่น",
      transportation: "รถยนต์ส่วนตัว",
      accommodation: "โรงแรมในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
      stops: [
        { name: "วัดพระธาตุขามแก่น", timeStart: "09:00", timeEnd: "11:00", description: "สักการะและชมสถาปัตยกรรม" },
        { name: "หมู่บ้านโฮมสเตย์", timeStart: "13:00", timeEnd: "16:00", description: "สัมผัสวิถีชีวิตชุมชนท้องถิ่น" }
      ],
      activities: [
        {
          title: "ล่องแก่งกะเหรี่ยง",
          date: endDate,
          timeStart: "14:00",
          timeEnd: "16:00",
          description: "ล่องแก่งชมธรรมชาติและวัฒนธรรมกะเหรี่ยง",
          cost: 500,
          type: "กิจกรรมผจญภัย",
          location: "แก่งกะเหรี่ยง"
        }
      ]
    }
  ];

  return createTrip({
    name: "ทริปครอบครัวขอนแก่น 3 วัน",
    category: "ครอบครัว",
    startDate,
    endDate,
    budget: 9000,
    plans
  });
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