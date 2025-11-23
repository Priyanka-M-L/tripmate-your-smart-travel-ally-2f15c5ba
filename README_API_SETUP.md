# Trip Mate - API Setup Guide

## Overview
Trip Mate uses **free, open APIs** that require **no API keys or billing**:
- **Open-Meteo API** for weather data (free, unlimited)
- **Open-Meteo Geocoding API** for location lookup (free, unlimited)
- **OpenStreetMap** via Leaflet for interactive maps (free, no key needed)
- **Overpass API** for nearby places discovery (free, no key needed)

## No Setup Required! 🎉

Unlike Google Maps Platform which requires:
- ❌ Credit card for billing
- ❌ API key management
- ❌ Usage limits and costs

Trip Mate works out of the box with:
- ✅ No API keys needed
- ✅ No billing or credit card
- ✅ Unlimited usage
- ✅ No configuration required

## Features Included

### 1. Weather Integration (Open-Meteo)
- Real-time weather forecasts (14 days)
- Temperature, humidity, precipitation probability
- Weather-based itinerary recommendations
- Auto-retry with exponential backoff
- Offline caching (30-minute TTL)

### 2. Interactive Maps (Leaflet + OpenStreetMap)
- Interactive map with zoom and pan
- Route visualization between stops
- Custom markers for activities, meals, hotels
- Nearby places discovery (cafes, hospitals, ATMs)
- Offline map caching with IndexedDB
- No tile limits or usage restrictions

### 3. Wellness AI Assistant
- Deterministic wellness recommendations
- Personalized trip optimizations based on:
  - Anxiety levels
  - Motion sickness
  - Claustrophobia
  - Heart sensitivity
  - Fatigue levels
- Optional AI-enhanced suggestions via Lovable AI
- Always returns structured, actionable recommendations

### 4. Smart Trip Sync Utility
- Centralized data orchestration
- Automatic geocoding with caching
- Weather updates with retry logic
- Event-driven architecture
- Offline fallback support

## API Endpoints Used

### Weather Data
```
https://api.open-meteo.com/v1/forecast
- Parameters: latitude, longitude, daily params, hourly params
- Rate limit: None
- Authentication: None required
```

### Geocoding
```
https://geocoding-api.open-meteo.com/v1/search
- Parameters: name, count, language, format
- Rate limit: None
- Authentication: None required
```

### Map Tiles
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
- Standard OpenStreetMap tiles
- Free for any use
- No rate limits for reasonable use
```

### Nearby Places
```
https://overpass-api.de/api/interpreter
- Overpass QL queries
- Community-maintained
- Free, no authentication
```

## Architecture

### TripSync Manager (`src/utils/tripSync.ts`)
Central orchestration utility that handles:
- Geocoding with caching (Map: locationName -> coordinates)
- Weather fetching with caching (Map: lat/lng -> weather, 30min TTL)
- Retry logic with exponential backoff (up to 3 attempts)
- Event hooks for real-time updates
- Offline data access

### Weather Smart Planner (`src/components/WeatherSmartPlanner.tsx`)
- Fetches 14-day weather forecast
- Analyzes weather patterns
- Generates smart recommendations:
  - Rain > 50% → Move outdoor activities
  - Temp > 35°C → Add hydration breaks
  - Extreme weather → High-priority alerts
- Real-time weather display on itinerary cards

### Interactive Map Engine (`src/components/InteractiveMapEngine.tsx`)
- Leaflet-based interactive map
- Auto-geocodes all itinerary locations
- Draws route polylines between stops
- Nearby places discovery toggle
- Offline mode with localStorage caching
- Custom markers for different activity types

### Wellness AI Assistant (`src/components/WellnessAIAssistant.tsx`)
- Rule-based deterministic layer (always works)
- Optional AI enhancement layer
- Structured JSON output:
  ```json
  {
    "wellnessProfile": {...},
    "itineraryAdjustments": [{day, itemId, action, reason}],
    "packingList": ["item1", "item2"],
    "chatReply": "friendly text"
  }
  ```

## Error Handling

### Weather Errors
- Date range validation (max 14 days forecast)
- Automatic retry with backoff (1s, 2s, 4s)
- Stale data fallback from cache
- User-friendly error messages
- Manual retry button

### Geocoding Errors
- Fallback to destination coordinates
- Cache-first strategy
- Graceful degradation to text-only display

### Map Errors
- Offline mode with cached tiles
- localStorage fallback for markers
- Clear offline indicator badge

### Wellness Profile Errors
- Graceful handling of missing profiles
- General wellness tips as fallback
- Non-blocking errors (doesn't break UI)

## Performance Optimizations

1. **Caching Strategy**
   - Weather: 30-minute TTL in memory
   - Geocoding: Permanent cache in memory
   - Map tiles: localStorage for offline access
   - Markers: localStorage with timestamp

2. **Parallel Processing**
   - Promise.allSettled for geocoding batch operations
   - Non-blocking weather fetches
   - Concurrent nearby places queries

3. **Smart Loading States**
   - Skeleton loaders for weather
   - Progressive map rendering
   - Optimistic UI updates

## Development

### Running Locally
```bash
npm install
npm run dev
```

No additional configuration needed!

### Testing APIs
All APIs can be tested directly in the browser:

**Weather Test:**
```
https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3488&daily=temperature_2m_max,temperature_2m_min&timezone=auto
```

**Geocoding Test:**
```
https://geocoding-api.open-meteo.com/v1/search?name=Paris&count=1&format=json
```

## Migration from Google Maps (if needed)

If you previously wanted to use Google Maps Platform, here's why Open-Meteo + OSM is better for this project:

| Feature | Google Maps | Open-Meteo + OSM |
|---------|-------------|------------------|
| Cost | $200+ free tier, then pay-per-use | 100% free, unlimited |
| Setup | API key + billing account | Zero setup |
| Weather | No native weather API | Native weather support |
| Geocoding | Limited free tier | Unlimited |
| Map tiles | Usage limits | No limits |
| Privacy | Tracks users | Privacy-friendly |

## Support

For issues or questions:
- Open-Meteo: https://open-meteo.com/en/docs
- Leaflet: https://leafletjs.com/reference.html
- OpenStreetMap: https://wiki.openstreetmap.org/

## Future Enhancements

Possible additions (all still free):
- [ ] Multi-day weather trends visualization
- [ ] Route optimization based on traffic (OpenRouteService)
- [ ] Public transport integration (Transitland)
- [ ] Historical weather data
- [ ] Custom map styles (Mapbox free tier)
