// src/lib/weatherApi.ts
const RAPIDAPI_KEY = '554d58f9camsh3e8d343e5db1ccep163327jsn553f0f626807';
const RAPIDAPI_HOST = 'open-weather13.p.rapidapi.com';

export interface WeatherForecast {
  date: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: string;
  dt?: number; // Unix timestamp
  dt_txt?: string; // Human readable timestamp
}

/**
 * Fetch weather forecast for a specific date range
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
    // For Khon Kaen, Thailand
    const latitude = 16.4419;
    const longitude = 102.8397;
    
    // Request temperature in Kelvin (default) and convert to Celsius in the code
    const url = `https://open-weather13.p.rapidapi.com/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=EN`;
    
    console.log(`Fetching weather data from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    
    console.log(`Weather API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`Weather API request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Weather API response data:", JSON.stringify(data, null, 2));
    
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
        
        // Convert Kelvin to Celsius (Kelvin - 273.15)
        const tempInCelsius = forecast.main.temp - 273.15;
        
        weatherData.push({
          date: date.toISOString().split('T')[0],
          temp: Math.round(tempInCelsius),
          condition: forecast.weather[0].description,
          humidity: forecast.main.humidity,
          wind: Math.round(forecast.wind.speed * 3.6), // Convert m/s to km/h
          forecast: getWeatherRecommendation(forecast.weather[0].main),
          dt: forecast.dt, // Unix timestamp
          dt_txt: forecast.dt ? new Date(forecast.dt * 1000).toLocaleString('th-TH') : undefined // Human readable timestamp
        });
      }
    }
    
    console.log("Processed weather data:", weatherData);
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return mock data in case of error
    return getMockWeatherData(startDate, endDate);
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

/**
 * Generate mock weather data for testing
 */
const getMockWeatherData = (startDate: string, endDate: string): WeatherForecast[] => {
  console.log("Using mock weather data due to API error");
  
  const weatherData: WeatherForecast[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Limit to 5 days to match API constraints
  const maxDays = Math.min(5, daysDiff);
  
  // Use realistic Celsius temperatures for Khon Kaen (typically 25-35°C)
  const conditions = [
    { temp: 32, condition: "แดดจัด", humidity: 65, wind: 8, forecast: "อากาศร้อน แนะนำดื่มน้ำบ่อย" },
    { temp: 30, condition: "เมฆบางส่วน", humidity: 70, wind: 6, forecast: "เหมาะสำหรับเดินเล่นกลางแจ้ง" },
    { temp: 29, condition: "มีฝนเล็กน้อย", humidity: 80, wind: 5, forecast: "พกร่มไว้ด้วย" },
    { temp: 28, condition: "ฝนตก", humidity: 85, wind: 7, forecast: "หลีกเลี่ยงกิจกรรมกลางแจ้ง" },
    { temp: 31, condition: "แดดจัด", humidity: 60, wind: 9, forecast: "ใช้ครีมกันแดดและดื่มน้ำให้เพียงพอ" }
  ];
  
  for (let i = 0; i < maxDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    weatherData.push({
      date: date.toISOString().split('T')[0],
      ...randomCondition,
      dt: Math.floor(Date.now() / 1000), // Add current timestamp for mock data
      dt_txt: new Date().toString() // Add current time string for mock data
    });
  }
  
  return weatherData;
};