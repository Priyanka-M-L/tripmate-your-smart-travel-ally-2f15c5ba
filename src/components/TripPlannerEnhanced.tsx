import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Cloud, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TripPlannerEnhancedProps {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export const TripPlannerEnhanced = ({
  destination,
  startDate,
  endDate,
  budget,
}: TripPlannerEnhancedProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [destination, startDate]);

  const fetchWeather = async () => {
    try {
      setLoadingWeather(true);
      // Geocode destination
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          destination
        )}&count=1`
      );
      const geoData = await geoResponse.json();

      if (geoData.results && geoData.results[0]) {
        const { latitude, longitude } = geoData.results[0];

        // Get weather forecast
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${startDate}&end_date=${startDate}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.daily) {
          const temp = Math.round(
            (weatherData.daily.temperature_2m_max[0] +
              weatherData.daily.temperature_2m_min[0]) /
              2
          );
          const weatherCode = weatherData.daily.weathercode[0];
          const condition = getWeatherCondition(weatherCode);
          const icon = getWeatherIcon(weatherCode);

          setWeather({ temperature: temp, condition, icon });
        }
      }
    } catch (error) {
      console.error("Weather fetch error:", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Stormy";
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const dailyBudget = budget / calculateDuration();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {/* Weather Card */}
      <Card className="glass-card p-6 hover-lift">
        <div className="flex items-center gap-3 mb-3">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Weather Forecast</h3>
        </div>
        {loadingWeather ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : weather ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{weather.icon}</span>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {weather.temperature}°C
                </p>
                <p className="text-sm text-muted-foreground">{weather.condition}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              on {new Date(startDate).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Weather data unavailable</p>
        )}
      </Card>

      {/* Budget Card */}
      <Card className="glass-card p-6 hover-lift">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Budget Overview</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Budget</span>
            <span className="text-lg font-bold text-foreground">
              ${budget.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Daily Budget</span>
            <span className="text-lg font-semibold text-primary">
              ${dailyBudget.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="text-xs font-medium text-foreground">
              {calculateDuration()} days
            </span>
          </div>
        </div>
      </Card>

      {/* Trip Duration Card */}
      <Card className="glass-card p-6 hover-lift">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Trip Duration</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(startDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(endDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
