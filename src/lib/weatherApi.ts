// src/lib/weatherApi.ts
const RAPIDAPI_KEY = '554d58f9camsh3e8d343e5db1ccep163327jsn553f0f626807';
const RAPIDAPI_HOST = 'open-weather13.p.rapidapi.com';

interface WeatherForecast {
  date: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: string;
}

interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: string;
}

/**
 * Fetch current weather for Khon Kaen (fixed location)
 * @returns Current weather data for Khon Kaen
 */
export const fetchWeatherByCity = async (): Promise<CurrentWeather> => {
  try {
    // Always fetch weather for Khon Kaen, Thailand
    const url = `https://open-weather13.p.rapidapi.com/city?city=Khon%20Kaen&lang=th`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 429) {
        console.warn('Weather API rate limit exceeded.');
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`Weather API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Process the current weather data
    return {
      temp: Math.round(((data.main?.temp || 0) - 32) * 5/9), // Convert Fahrenheit to Celsius
      condition: data.weather?.[0]?.description || "ไม่มีข้อมูล",
      humidity: data.main?.humidity || 0,
      wind: Math.round((data.wind?.speed || 0) * 1.60934), // Convert mph to km/h
      forecast: getWeatherRecommendation(data.weather?.[0]?.main || "unknown")
    };
  } catch (error) {
    console.error('Error fetching weather data for Khon Kaen:', error);
    // Re-throw the error instead of returning mock data
    throw error;
  }
};

/**
 * Fetch weather forecast for a specific date range for Khon Kaen
 * Note: API only provides 5 days of forecast data
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Array of weather data for each day (up to 5 days)
 */
export const fetchWeatherForecast = async (
  startDate: string,
  endDate: string
): Promise<WeatherForecast[]> => {
  try {
    // Always use Khon Kaen coordinates
    const lat = 16.4419;
    const lon = 102.8397;

    const url = `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=${lat}&longitude=${lon}&lang=th`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 429) {
        console.warn('Weather API rate limit exceeded.');
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`Weather API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Parse the weather data for the date range
    const weatherData: WeatherForecast[] = [];

    // Calculate the number of days between start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Process the forecast data (API only provides 5 days)
    const maxDays = Math.min(5, daysDiff); // Limit to 5 days due to API constraints

    if (data && data.list) {
      for (let i = 0; i < Math.min(maxDays, data.list.length); i++) {
        const forecast = data.list[i];
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        weatherData.push({
          date: date.toISOString().split('T')[0],
          temp: Math.round(forecast.main.temp - 273.15), // Convert Kelvin to Celsius
          condition: forecast.weather[0].description,
          humidity: forecast.main.humidity,
          wind: Math.round(forecast.wind.speed * 3.6), // Convert m/s to km/h
          forecast: getWeatherRecommendation(forecast.weather[0].main)
        });
      }
    }

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Re-throw the error instead of returning mock data
    throw error;
  }
};

/**
 * Generate weather recommendation based on conditions
 */
const getWeatherRecommendation = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case 'thunderstorm':
      return 'พกร่มไว้ด้วยและหลีกเลี่ยงพื้นที่โล่งแจ้ง';
    case 'drizzle':
    case 'rain':
      return 'พกร่มไว้ด้วย';
    case 'snow':
      return 'เตรียมเสื้อหนาวและรองเท้าที่เหมาะสม';
    case 'clear':
      return 'อากาศแจ่มใส เหมาะสำหรับกิจกรรมกลางแจ้ง';
    case 'clouds':
      return 'มีเมฆเล็กน้อย เหมาะสำหรับกิจกรรมกลางแจ้ง';
    default:
      return 'ตรวจสอบสภาพอากาศก่อนออกเดินทาง';
  }
};