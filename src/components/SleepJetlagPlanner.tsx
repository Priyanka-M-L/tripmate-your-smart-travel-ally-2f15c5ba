import { Card } from "@/components/ui/card";
import { Moon, Sun, Clock, Lightbulb } from "lucide-react";

interface SleepJetlagPlannerProps {
  destination: string;
  startDate: string;
  duration: number;
}

export const SleepJetlagPlanner = ({ 
  destination, 
  startDate, 
  duration 
}: SleepJetlagPlannerProps) => {
  // Simplified timezone offset calculation
  const getTimezoneOffset = (location: string): number => {
    // This is simplified - in production, use a proper timezone API
    const zones: Record<string, number> = {
      'paris': 1, 'london': 0, 'new york': -5, 'tokyo': 9,
      'sydney': 10, 'dubai': 4, 'singapore': 8, 'los angeles': -8
    };
    
    const match = Object.keys(zones).find(city => 
      location.toLowerCase().includes(city)
    );
    
    return match ? zones[match] : 0;
  };

  const offset = getTimezoneOffset(destination);
  const hoursAhead = Math.abs(offset);
  const direction = offset > 0 ? 'ahead' : 'behind';

  const getJetlagTips = () => {
    if (hoursAhead < 3) {
      return {
        severity: 'Minimal',
        color: 'text-green-500',
        tips: [
          'Adjust sleep schedule by 1 hour before departure',
          'Stay hydrated during flight',
          'Get some sunlight upon arrival',
        ]
      };
    } else if (hoursAhead < 6) {
      return {
        severity: 'Moderate',
        color: 'text-yellow-500',
        tips: [
          'Adjust sleep by 1-2 hours, 3 days before trip',
          'Avoid caffeine 6 hours before target bedtime',
          'Use melatonin supplement if needed (consult doctor)',
          'Take short 20-min naps if extremely tired',
        ]
      };
    } else {
      return {
        severity: 'Significant',
        color: 'text-red-500',
        tips: [
          'Start adjusting sleep 1 week before departure',
          'Book flights that arrive in evening if possible',
          'Avoid alcohol and heavy meals on flight',
          'Use sleep mask and earplugs',
          'Consider melatonin (consult doctor first)',
          'Plan light activities for first 2 days',
        ]
      };
    }
  };

  const jetlagInfo = getJetlagTips();

  return (
    <Card className="glass-card p-6 hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <Moon className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Sleep & Jet Lag Recovery</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Time Difference</span>
          </div>
          <span className="text-sm font-bold text-foreground">
            {hoursAhead} hours {direction}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/10">
          <span className="text-sm font-medium text-foreground">Jet Lag Severity</span>
          <span className={`text-sm font-bold ${jetlagInfo.color}`}>
            {jetlagInfo.severity}
          </span>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Recovery Tips</h4>
          </div>
          
          <ul className="space-y-2">
            {jetlagInfo.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 pt-3 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            Light Exposure Schedule
          </h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <strong className="text-foreground">Day 1-2:</strong> Get morning sunlight 
              exposure (helps reset circadian rhythm)
            </p>
            <p>
              <strong className="text-foreground">Evening:</strong> Dim lights 2 hours before 
              target bedtime
            </p>
            <p>
              <strong className="text-foreground">Night:</strong> Avoid screens 1 hour before sleep
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-primary/10 mt-4">
          <p className="text-xs font-medium text-foreground mb-1">💡 Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            Stay active during local daytime hours, even if tired. 
            It helps your body adapt faster to the new timezone.
          </p>
        </div>
      </div>
    </Card>
  );
};
