import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WeatherCardProps {
  destination: string;
  startDate: string;
  endDate: string;
}

interface WeatherData {
  date: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProb: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export const WeatherCard = ({
  destination,
  startDate,
  endDate,
}: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchWeather();
  }, [destination, startDate, endDate]);

  const fetchWeather = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }
    try {
      setLoading(true);
      setError(false);

      // First, geocode the destination to get coordinates
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
      );

      if (!geocodeResponse.ok) throw new Error("Geocoding failed");
      
      const geocodeData = await geocodeResponse.json();
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Location not found");
      }

      const { latitude: lat, longitude: lon } = geocodeData.results[0];

      // Use current date for forecast (API only allows 14 days forecast)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 7);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,wind_speed_10m&start_date=${formatDate(today)}&end_date=${formatDate(futureDate)}&timezone=auto`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Weather API error:", response.status, errorText);
        throw new Error("Weather fetch failed");
      }

      const data = await response.json();
      const weatherData: WeatherData[] = data.daily.time.map(
        (date: string, i: number) => ({
          date,
          temperature: Math.round(
            (data.daily.temperature_2m_max[i] +
              data.daily.temperature_2m_min[i]) /
              2
          ),
          temperatureMin: Math.round(data.daily.temperature_2m_min[i]),
          temperatureMax: Math.round(data.daily.temperature_2m_max[i]),
          precipitationProb: data.daily.precipitation_probability_max?.[i] || 0,
          humidity: Math.round(data.current?.relative_humidity_2m || 0),
          windSpeed: Math.round(data.current?.wind_speed_10m || 0),
          weatherCode: data.daily.weather_code?.[i] || 0,
        })
      );

      setWeather(weatherData);
      
      // Cache the weather data
      localStorage.setItem(`weather_${destination}`, JSON.stringify({
        weather: weatherData,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error("Weather fetch error:", err);
      
      // Retry logic with exponential backoff
      if (retryCount < 3 && !isRetry) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        toast.info(`Retrying in ${delay / 1000}s... (${retryCount + 1}/3)`);
        setTimeout(() => fetchWeather(true), delay);
        return;
      }
      
      setError(true);
      
      // Try to load cached weather
      const cached = localStorage.getItem(`weather_${destination}`);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 30 * 60 * 1000) { // 30 min cache
            setWeather(cachedData.weather);
            toast.info("Showing cached weather data");
            setError(false);
          }
        } catch (e) {
          console.error("Failed to load cached weather:", e);
        }
      }
      
      if (retryCount >= 3) {
        toast.error("Unable to fetch weather after 3 attempts");
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, temp: number) => {
    if (code === 0) return temp > 25 ? "☀️" : "🌤️";
    if (code >= 1 && code <= 3) return "⛅";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 99) return "⛈️";
    return "🌤️";
  };

  return (
    <Card className="p-6 glass-card border-2 border-border/50 hover-lift gradient-border hover-glow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-ocean flex items-center justify-center shadow-soft">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Weather Forecast</h3>
            <p className="text-sm text-muted-foreground">{destination}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">
            {retryCount > 0 ? `Retrying... (${retryCount}/3)` : "Loading weather data..."}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center mx-auto mb-4">
            <Cloud className="w-10 h-10 text-primary" />
          </div>
          <h4 className="text-lg font-semibold text-foreground mb-2">Weather Unavailable</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {retryCount >= 3 ? "Failed after 3 retry attempts" : "Unable to load weather data"}
          </p>
          <p className="text-xs text-muted-foreground mb-6">Check your connection and destination name</p>
          <Button 
            onClick={() => fetchWeather(false)} 
            variant="outline" 
            size="sm"
            className="hover-lift"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {weather.slice(0, 5).map((day, index) => (
            <div
              key={day.date}
              className="group flex justify-between items-center p-4 rounded-xl bg-gradient-card hover:bg-accent/20 transition-all duration-300 border border-border/50 hover:border-primary/50 hover-lift"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-sm font-semibold text-foreground">
                    {index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {getWeatherIcon(day.weatherCode, day.temperature)}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {day.temperature}
                    </span>
                    <span className="text-lg text-muted-foreground">°C</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span>{day.temperatureMin}°</span>
                    <span>/</span>
                    <span>{day.temperatureMax}°</span>
                  </div>
                </div>

                {day.precipitationProb > 0 && (
                  <div className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg bg-info/10">
                    <span className="text-xs text-muted-foreground">Rain</span>
                    <span className="text-sm font-semibold text-info">
                      {day.precipitationProb}%
                    </span>
                  </div>
                )}

                {index === 0 && day.humidity > 0 && (
                  <div className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg bg-sky/10">
                    <span className="text-xs text-muted-foreground">Humid</span>
                    <span className="text-sm font-semibold text-sky">
                      {day.humidity}%
                    </span>
                  </div>
                )}

                {index === 0 && day.windSpeed > 0 && (
                  <div className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg bg-forest/10">
                    <span className="text-xs text-muted-foreground">Wind</span>
                    <span className="text-sm font-semibold text-forest">
                      {day.windSpeed}km/h
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
