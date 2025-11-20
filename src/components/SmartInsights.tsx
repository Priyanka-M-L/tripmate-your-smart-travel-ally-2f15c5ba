import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  Users, 
  Clock, 
  CloudSun, 
  DoorOpen, 
  TrendingUp,
  AlertCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface InsightsData {
  crowdLevel: "low" | "moderate" | "high" | "very-high";
  crowdDescription: string;
  bestTimeToVisit: string;
  bestTimeReason: string;
  placeStatus: string;
  placeHours: string;
  weatherSummary: string;
  recommendations: string[];
}

interface SmartInsightsProps {
  destination: string;
  startDate: string;
  interests?: string;
}

const crowdColors = {
  low: "bg-green-100 text-green-800 border-green-300",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  "very-high": "bg-red-100 text-red-800 border-red-300",
};

const crowdLabels = {
  low: "Low Crowds",
  moderate: "Moderate Crowds",
  high: "High Crowds",
  "very-high": "Very Crowded",
};

export const SmartInsights = ({ destination, startDate, interests }: SmartInsightsProps) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [destination, startDate]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("trip-insights", {
        body: { destination, startDate, interests },
      });

      if (error) throw error;
      setInsights(data.insights);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
      toast.error("Could not load smart insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card hover-lift animate-pulse">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner message="Loading smart insights..." />
        </div>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Smart Travel Insights
        </h3>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Crowd Forecast */}
        <Card className="p-5 glass-card hover-lift">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">Crowd Forecast</h4>
                <Badge 
                  variant="outline" 
                  className={crowdColors[insights.crowdLevel]}
                >
                  {crowdLabels[insights.crowdLevel]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{insights.crowdDescription}</p>
            </div>
          </div>
        </Card>

        {/* Best Time to Visit */}
        <Card className="p-5 glass-card hover-lift">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Best Time to Visit</h4>
              <p className="text-sm font-medium text-primary mb-1">{insights.bestTimeToVisit}</p>
              <p className="text-xs text-muted-foreground">{insights.bestTimeReason}</p>
            </div>
          </div>
        </Card>

        {/* Weather Summary */}
        <Card className="p-5 glass-card hover-lift">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CloudSun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Weather Outlook</h4>
              <p className="text-sm text-muted-foreground">{insights.weatherSummary}</p>
            </div>
          </div>
        </Card>

        {/* Place Status */}
        <Card className="p-5 glass-card hover-lift">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DoorOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">Place Status</h4>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400">
                  {insights.placeStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{insights.placeHours}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-3">Smart Recommendations</h4>
              <ul className="space-y-2">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
