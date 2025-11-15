import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Loader2 } from "lucide-react";

interface WeatherCardProps {
  destination: string;
  startDate: string;
  endDate: string;
}

interface WeatherData {
  date: string;
  temperature: number;
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

      // Using Open-Meteo API (no key required)
      // Using fixed coordinates for Paris as example
      const lat = 48.8566;
      const lon = 2.3522;

      // Use current date for forecast (API only allows limited future range)
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 7);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&start_date=${formatDate(today)}&end_date=${formatDate(futureDate)}&timezone=auto`
      );

      if (!response.ok) throw new Error("Weather fetch failed");

      const data = await response.json();
      const weatherData: WeatherData[] = data.daily.time.map(
        (date: string, i: number) => ({
          date,
          temperature: Math.round(
            (data.daily.temperature_2m_max[i] +
              data.daily.temperature_2m_min[i]) /
              2
          ),
        })
      );

      setWeather(weatherData);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Weather Forecast</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-sm text-muted-foreground">
          Weather data unavailable
        </p>
      ) : (
        <div className="space-y-2">
          {weather.slice(0, 5).map((day) => (
            <div
              key={day.date}
              className="flex justify-between items-center py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="font-semibold text-foreground">
                {day.temperature}°C
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
