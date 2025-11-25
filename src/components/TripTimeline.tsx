import { Clock, MapPin, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineItem {
  id: string;
  title: string;
  time: string | null;
  location: string | null;
  description: string | null;
  cost: number | null;
  type: string | null;
  day_number: number;
}

interface TripTimelineProps {
  items: TimelineItem[];
}

export const TripTimeline = ({ items }: TripTimelineProps) => {
  // Group items by day
  const itemsByDay = items.reduce((acc, item) => {
    if (!acc[item.day_number]) {
      acc[item.day_number] = [];
    }
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, TimelineItem[]>);

  const days = Object.keys(itemsByDay).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8">
      {days.map((day) => (
        <div key={day} className="relative pl-8 animate-fade-in">
          {/* Day label */}
          <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-ocean text-white font-bold shadow-soft">
            {day}
          </div>
          
          <div className="ml-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Day {day}</h3>
            
            <div className="space-y-4">
              {itemsByDay[Number(day)].map((item, index) => (
                <Card 
                  key={item.id} 
                  className="p-4 bg-gradient-card border-border hover:shadow-hover transition-all hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Time indicator */}
                    {item.time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[80px]">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{item.time}</span>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-2">
                      {/* Title and type */}
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{item.title}</h4>
                        {item.type && (
                          <span className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                            {item.type}
                          </span>
                        )}
                      </div>
                      
                      {/* Location */}
                      {item.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      
                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      
                      {/* Cost */}
                      {item.cost && item.cost > 0 && (
                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          <DollarSign className="w-4 h-4" />
                          <span>₹{item.cost.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Connecting line */}
          {Number(day) < days.length && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-ocean/20" />
          )}
        </div>
      ))}
    </div>
  );
};
