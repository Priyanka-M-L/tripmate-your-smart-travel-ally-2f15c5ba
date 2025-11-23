/**
 * TripSync - Central orchestration utility for trip data synchronization
 * Coordinates weather updates, geocoding, wellness suggestions, and map updates
 */

interface TripSyncEventHandlers {
  onPlaceUpdate?: (placeId: string, data: any) => void;
  onWeatherUpdate?: (locationId: string, weather: any) => void;
  onWellnessUpdate?: (suggestions: any) => void;
  onGeocodingComplete?: (placeId: string, coords: { lat: number; lng: number }) => void;
}

class TripSyncManager {
  private handlers: TripSyncEventHandlers = {};
  private weatherCache: Map<string, { data: any; timestamp: number }> = new Map();
  private geocodeCache: Map<string, { lat: number; lng: number }> = new Map();
  private readonly WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Register event handlers for trip updates
   */
  on(handlers: TripSyncEventHandlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Geocode a location and cache the result
   */
  async geocode(locationName: string, destination: string): Promise<{ lat: number; lng: number } | null> {
    const cacheKey = `${locationName}-${destination}`;
    
    // Check cache first
    if (this.geocodeCache.has(cacheKey)) {
      return this.geocodeCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          locationName + " " + destination
        )}&count=1&language=en&format=json`
      );

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();
      if (data.results && data.results[0]) {
        const coords = {
          lat: data.results[0].latitude,
          lng: data.results[0].longitude,
        };
        this.geocodeCache.set(cacheKey, coords);
        return coords;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }

    return null;
  }

  /**
   * Fetch weather for a location with caching and retry logic
   */
  async fetchWeather(
    lat: number,
    lng: number,
    startDate?: string,
    endDate?: string,
    retries = 3
  ): Promise<any> {
    const cacheKey = `${lat}-${lng}`;
    const cached = this.weatherCache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.WEATHER_CACHE_TTL) {
      return cached.data;
    }

    // Calculate safe date range
    const today = new Date();
    const maxForecastDate = new Date();
    maxForecastDate.setDate(today.getDate() + 14);

    const safeStartDate = startDate 
      ? (new Date(startDate) < today ? today.toISOString().split('T')[0] : startDate)
      : today.toISOString().split('T')[0];
    
    const safeEndDate = endDate && new Date(endDate) <= maxForecastDate
      ? endDate
      : maxForecastDate.toISOString().split('T')[0];

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,apparent_temperature_max&hourly=relative_humidity_2m&start_date=${safeStartDate}&end_date=${safeEndDate}&timezone=auto`
        );

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Normalize weather data
        const normalizedData = {
          lat,
          lng,
          current: {
            tempC: data.daily?.temperature_2m_max?.[0] || 0,
            feelsLikeC: data.daily?.apparent_temperature_max?.[0] || 0,
            humidity: data.hourly?.relative_humidity_2m?.[0] || 0,
            precipitationProb: data.daily?.precipitation_probability_max?.[0] || 0,
            weatherCode: data.daily?.weather_code?.[0] || 0,
          },
          daily: data.daily?.time?.map((date: string, i: number) => ({
            date,
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precipitationProb: data.daily.precipitation_probability_max[i] || 0,
            weatherCode: data.daily.weather_code[i],
          })) || [],
        };

        // Cache the result
        this.weatherCache.set(cacheKey, {
          data: normalizedData,
          timestamp: Date.now(),
        });

        this.handlers.onWeatherUpdate?.(cacheKey, normalizedData);
        return normalizedData;
      } catch (error) {
        console.error(`Weather fetch attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries - 1) {
          // Return cached data if available, even if stale
          if (cached) {
            return { ...cached.data, isStale: true };
          }
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return null;
  }

  /**
   * Sync all places in an itinerary
   */
  async syncItinerary(items: any[], destination: string) {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        if (!item.location) return null;

        // Geocode if needed
        const coords = await this.geocode(item.location, destination);
        if (coords) {
          this.handlers.onGeocodingComplete?.(item.id, coords);
          
          // Fetch weather for this location
          const weather = await this.fetchWeather(coords.lat, coords.lng);
          return { itemId: item.id, coords, weather };
        }
        return null;
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter(Boolean);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.weatherCache.clear();
    this.geocodeCache.clear();
  }

  /**
   * Get cached weather data (useful for offline mode)
   */
  getCachedWeather(lat: number, lng: number) {
    const cacheKey = `${lat}-${lng}`;
    return this.weatherCache.get(cacheKey)?.data;
  }
}

export const tripSync = new TripSyncManager();
