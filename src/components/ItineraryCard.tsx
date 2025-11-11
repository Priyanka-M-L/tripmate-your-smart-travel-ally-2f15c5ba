import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

interface ItineraryItem {
  time?: string;
  activity: string;
  location?: string;
  description?: string;
}

interface ItineraryCardProps {
  day: number;
  items: ItineraryItem[];
}

export const ItineraryCard = ({ day, items }: ItineraryCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card hover:shadow-hover transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
          {day}
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Day {day}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border-l-2 border-primary/30 pl-4 pb-4 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {item.time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    {item.time}
                  </div>
                )}
                <h4 className="font-semibold text-foreground mb-1">{item.activity}</h4>
                {item.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
