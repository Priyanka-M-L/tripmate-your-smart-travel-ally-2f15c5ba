import { Card } from "@/components/ui/card";

export const CardSkeleton = () => (
  <Card className="p-6 glass-card">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  </Card>
);

export const MapSkeleton = () => (
  <Card className="p-6 glass-card">
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
      <div className="h-96 bg-muted rounded-xl"></div>
    </div>
  </Card>
);

export const WeatherSkeleton = () => (
  <Card className="p-6 glass-card">
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted"></div>
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
            <div className="h-3 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);
