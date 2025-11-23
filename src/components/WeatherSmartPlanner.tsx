import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, 
  AlertTriangle, Thermometer, Loader2, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  precipitation_probability: number;
  weather_code: number;
  apparent_temperature: number;
}

interface WeatherAlert {
  type: "rain" | "heat" | "extreme";
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string;
}

interface WeatherSmartPlannerProps {
  destination: string;
  startDate: string;
  endDate: string;
  onWeatherAdjustment?: (alerts: WeatherAlert[]) => void;
}

export const WeatherSmartPlanner = ({
  destination,
  startDate,
  endDate,
  onWeatherAdjustment,
}: WeatherSmartPlannerProps) => {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchWeatherData();
  }, [destination, startDate, endDate]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Geocode destination
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
      );

      if (!geocodeResponse.ok) throw new Error("Geocoding failed");
      
      const geocodeData = await geocodeResponse.json();
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Location not found");
      }

      const { latitude: lat, longitude: lon } = geocodeData.results[0];

      // Calculate safe date range (Open-Meteo API limits to 16 days forecast)
      const today = new Date();
      const maxForecastDate = new Date();
      maxForecastDate.setDate(today.getDate() + 14); // 14 days forecast limit

      const safeStartDate = new Date(startDate) < today ? today.toISOString().split('T')[0] : startDate;
      const safeEndDate = new Date(endDate) > maxForecastDate 
        ? maxForecastDate.toISOString().split('T')[0] 
        : endDate;

      // Fetch detailed weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,apparent_temperature_max&hourly=relative_humidity_2m&start_date=${safeStartDate}&end_date=${safeEndDate}&timezone=auto`
      );

      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        console.error("Weather API error:", errorText);
        throw new Error("Weather fetch failed");
      }

      const data = await weatherResponse.json();
      
      const weatherData: WeatherData[] = data.daily.time.map(
        (date: string, i: number) => ({
          date,
          temperature: Math.round(
            (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2
          ),
          humidity: Math.round(
            data.hourly.relative_humidity_2m[i * 24] || 50
          ),
          precipitation_probability: data.daily.precipitation_probability_max[i] || 0,
          weather_code: data.daily.weather_code[i],
          apparent_temperature: Math.round(data.daily.apparent_temperature_max[i]),
        })
      );

      setWeather(weatherData);
      analyzeWeatherAlerts(weatherData);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(true);
      toast.error("Unable to load weather data");
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeatherAlerts = (weatherData: WeatherData[]) => {
    const newAlerts: WeatherAlert[] = [];

    weatherData.forEach((day, index) => {
      // Rain alert
      if (day.precipitation_probability > 50) {
        newAlerts.push({
          type: "rain",
          severity: day.precipitation_probability > 80 ? "high" : "medium",
          message: `Day ${index + 1}: ${day.precipitation_probability}% chance of rain`,
          recommendation: "Move outdoor activities to covered venues or reschedule",
        });
      }

      // Heat alert
      if (day.apparent_temperature > 35) {
        newAlerts.push({
          type: "heat",
          severity: day.apparent_temperature > 40 ? "high" : "medium",
          message: `Day ${index + 1}: Feels like ${day.apparent_temperature}°C`,
          recommendation: "Add hydration breaks every 2 hours, avoid midday sun",
        });
      }

      // Extreme weather alert (based on weather codes)
      if (day.weather_code >= 95) {
        newAlerts.push({
          type: "extreme",
          severity: "high",
          message: `Day ${index + 1}: Severe weather expected`,
          recommendation: "Consider indoor activities or postponing this day",
        });
      }
    });

    setAlerts(newAlerts);
    if (onWeatherAdjustment) {
      onWeatherAdjustment(newAlerts);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-6 h-6 text-warning" />;
    if (code <= 48) return <Cloud className="w-6 h-6 text-muted-foreground" />;
    if (code <= 67) return <CloudRain className="w-6 h-6 text-info" />;
    return <Wind className="w-6 h-6 text-destructive" />;
  };

  const getWeatherEmoji = (code: number) => {
    if (code <= 3) return "☀️";
    if (code <= 48) return "⛅";
    if (code <= 67) return "🌧️";
    return "⛈️";
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="text-center py-8">
          <Cloud className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">Weather data unavailable</p>
          <Button onClick={fetchWeatherData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card border-2 border-border/50 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Weather Smart Planner</h3>
            <p className="text-xs text-muted-foreground">{destination}</p>
          </div>
        </div>
        <Button onClick={fetchWeatherData} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border-2 ${
                alert.severity === "high"
                  ? "bg-destructive/10 border-destructive/30"
                  : alert.severity === "medium"
                  ? "bg-warning/10 border-warning/30"
                  : "bg-info/10 border-info/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.severity === "high"
                      ? "text-destructive"
                      : alert.severity === "medium"
                      ? "text-warning"
                      : "text-info"
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground mb-1">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 {alert.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Weather Cards */}
      <div className="space-y-3">
        {weather.map((day, index) => (
          <div
            key={day.date}
            className="p-4 rounded-xl bg-accent/20 border border-accent hover:bg-accent/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getWeatherEmoji(day.weather_code)}</span>
                <div>
                  <p className="font-semibold text-foreground">
                    {index === 0
                      ? "Today"
                      : new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {day.temperature}°C
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-info" />
                      <span className="text-xs text-muted-foreground">
                        {day.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-info" />
                      <span className="text-xs text-muted-foreground">
                        {day.precipitation_probability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {day.temperature}°C
                </p>
                <p className="text-xs text-muted-foreground">
                  Feels {day.apparent_temperature}°C
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
