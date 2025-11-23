import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
  precipitationProb: number;
}

export const WeatherCard = ({
  destination,
  startDate,
  endDate,
}: WeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchWeather();
  }, [destination, startDate, endDate]);

  const fetchWeather = async () => {
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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&start_date=${formatDate(today)}&end_date=${formatDate(futureDate)}&timezone=auto`
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
          precipitationProb: data.daily.precipitation_probability_max?.[i] || 0,
        })
      );

      setWeather(weatherData);
    } catch (err) {
      console.error("Weather fetch error:", err);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card border-2 border-border/50 hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Weather Forecast</h3>
          <p className="text-xs text-muted-foreground">{destination}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        </div>
      ) : (
        <div className="space-y-2">
          {weather.slice(0, 5).map((day, index) => (
            <div
              key={day.date}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">
                {index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {day.temperature > 25 ? "☀️" : day.temperature > 15 ? "⛅" : "🌤️"}
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    {day.temperature}°C
                  </span>
                  {day.precipitationProb > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {day.precipitationProb}% rain
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
