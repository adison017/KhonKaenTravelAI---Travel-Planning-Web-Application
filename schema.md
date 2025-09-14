# KhonKaenTravelAI Data Schema

This document describes the data structure used to store travel plan information in localStorage for the KhonKaenTravelAI application.

## Collection Structure

```json
{
  "collectionId": "string",
  "name": "string",
  "category": "string",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "budget": "number",
  "weatherData": [
    {
      "date": "string (YYYY-MM-DD)",
      "temp": "number",
      "condition": "string",
      "humidity": "number",
      "wind": "number",
      "forecast": "string"
    }
  ],
  "plans": [
    {
      "day": "number",
      "startLocation": "string",
      "endLocation": "string",
      "transportation": "string",
      "accommodation": "string",
      "stops": [
        {
          "name": "string",
          "timeStart": "string (HH:MM)",
          "timeEnd": "string (HH:MM)",
          "description": "string (optional)"
        }
      ],
      "activities": [
        {
          "title": "string",
          "date": "string (YYYY-MM-DD)",
          "timeStart": "string (HH:MM)",
          "timeEnd": "string (HH:MM)",
          "description": "string",
          "cost": "number",
          "type": "string",
          "location": "string (optional)"
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Collection Level
- `collectionId`: Unique identifier for the travel collection
- `name`: Name of the travel collection/plan
- `category`: Category of the trip (e.g., "ครอบครัว", "เพื่อน", "เดินทางคนเดียว")
- `startDate`: Start date of the trip in YYYY-MM-DD format
- `endDate`: End date of the trip in YYYY-MM-DD format
- `budget`: Total budget for the trip in Thai Baht (฿)
- `weatherData`: Array of weather information for each day of the trip

### Weather Data
- `date`: Date for which the weather data applies
- `temp`: Temperature in Celsius
- `condition`: Weather condition description (e.g., "แดดจัด", "เมฆบางส่วน")
- `humidity`: Humidity percentage
- `wind`: Wind speed in km/h
- `forecast`: Weather forecast/advice for the day

The application may also store more detailed weather data from OpenWeatherMap API with these additional fields:
- `main`: Main weather condition (e.g., "Clouds", "Rain")
- `description`: Detailed weather description (e.g., "scattered clouds", "light rain")
- `icon`: Weather icon code for display
- `pressure`: Atmospheric pressure in hPa
- `visibility`: Visibility distance in meters
- `feels_like`: Temperature accounting for humidity and wind
- `temp_min`: Minimum temperature for the day
- `temp_max`: Maximum temperature for the day
- `clouds`: Cloud coverage percentage
- `dt`: Unix timestamp of the weather data
- `dt_txt`: Formatted date/time string

### Plan (per day)
- `day`: Day number of the trip (1, 2, 3, etc.)
- `startLocation`: Starting location for the day
- `endLocation`: Ending location for the day
- `transportation`: Transportation method for the day
- `accommodation`: Accommodation information for the day
- `stops`: Array of locations to visit during the day with time information
  - `name`: Name of the location
  - `timeStart`: Start time for visiting the location (HH:MM format)
  - `timeEnd`: End time for visiting the location (HH:MM format)
  - `description`: Optional description of the stop
- `activities`: Array of activities planned for the day

### Activity
- `title`: Title/name of the activity
- `date`: Date of the activity in YYYY-MM-DD format
- `timeStart`: Start time of the activity in HH:MM format
- `timeEnd`: End time of the activity in HH:MM format
- `description`: Description of the activity
- `cost`: Cost of the activity in Thai Baht (฿)
- `type`: Type/category of the activity (e.g., "ธรรมชาติ", "อาหารท้องถิ่น", "วัฒนธรรม")
- `location`: Optional location information for the activity

## Example Data

```json
{
  "collectionId": "trip-12345",
  "name": "ทริปครอบครัวขอนแก่น 3 วัน",
  "category": "ครอบครัว",
  "startDate": "2025-04-10",
  "endDate": "2025-04-12",
  "budget": 9000,
  "weatherData": [
    {
      "date": "2025-04-10",
      "temp": 32,
      "condition": "แดดจัด",
      "humidity": 65,
      "wind": 8,
      "forecast": "อากาศร้อน แนะนำดื่มน้ำบ่อย"
    }
  ],
  "plans": [
    {
      "day": 1,
      "startLocation": "บ้านพักในตัวเมืองขอนแก่น",
      "endLocation": "สวนสาธารณะศรีมหาโพธิ",
      "transportation": "รถส่วนตัว",
      "accommodation": "บ้านพักในตัวเมืองขอนแก่น (1,200 บาท/คืน)",
      "stops": [
        {
          "name": "หอศิลปวัฒนธรรมแห่งจังหวัดขอนแก่น",
          "timeStart": "09:00",
          "timeEnd": "10:30",
          "description": "ชมนิทรรศการศิลปะพื้นบ้าน"
        },
        {
          "name": "ตลาดเหนือ",
          "timeStart": "11:00",
          "timeEnd": "12:00",
          "description": "ชิมข้าวเหนียวหมูปิ้งและน้ำตกแตงโม"
        }
      ],
      "activities": [
        {
          "title": "เยี่ยมชมสวนสาธารณะศรีมหาโพธิ",
          "date": "2025-04-10",
          "timeStart": "08:00",
          "timeEnd": "10:00",
          "description": "เดินเล่นรับลมเย็น ชมพระพุทธรูปใหญ่และทะเลสาบ",
          "cost": 0,
          "type": "ธรรมชาติ"
        }
      ]
    }
  ]
}
```

## LocalStorage Usage

Data is stored in localStorage with the key format: `collection_{collectionId}`

Example:
```javascript
// Save collection to localStorage
localStorage.setItem(`collection_${collectionId}`, JSON.stringify(collectionData));

// Retrieve collection from localStorage
const collectionData = JSON.parse(localStorage.getItem(`collection_${collectionId}`));
```

## Data Validation

When saving to localStorage, ensure:
1. All required fields are present
2. Date formats follow YYYY-MM-DD pattern
3. Time formats follow HH:MM pattern
4. Numeric values are properly typed
5. Arrays contain appropriate data types

This schema ensures consistent data storage and retrieval across the KhonKaenTravelAI application.