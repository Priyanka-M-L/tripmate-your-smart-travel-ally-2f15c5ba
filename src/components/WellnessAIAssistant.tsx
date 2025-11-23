import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Brain, Wind, Users, Volume2, 
  Loader2, Sparkles, AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WellnessProfile {
  anxiety: string;
  motion_sickness: string;
  claustrophobia: string;
  heart_sensitivity: string;
  mental_wellness: string;
  mood_issues: string;
  need_frequent_breaks: boolean;
  need_hydration_reminders: boolean;
}

interface WellnessSuggestion {
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

interface WellnessAIAssistantProps {
  destination: string;
  tripDuration: number;
  items: any[];
}

export const WellnessAIAssistant = ({
  destination,
  tripDuration,
  items,
}: WellnessAIAssistantProps) => {
  const [profile, setProfile] = useState<WellnessProfile | null>(null);
  const [suggestions, setSuggestions] = useState<WellnessSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchWellnessProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      generateSuggestions();
    }
  }, [profile, items]);

  const fetchWellnessProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('wellness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(data);
    } catch (error) {
      console.error("Error fetching wellness profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!profile) return;

    setGenerating(true);
    const newSuggestions: WellnessSuggestion[] = [];

    // Anxiety-based suggestions
    if (profile.anxiety === 'high' || profile.mental_wellness === 'poor') {
      newSuggestions.push({
        category: "Mental Wellness",
        title: "Schedule Mindfulness Breaks",
        description: "Add 15-minute meditation or quiet time between activities to manage anxiety and maintain calm throughout your trip.",
        priority: "high",
        icon: "🧘",
      });

      newSuggestions.push({
        category: "Activity Pacing",
        title: "Reduce Activity Density",
        description: "Limit to 3-4 major activities per day instead of rushing. Quality over quantity helps reduce overwhelm.",
        priority: "medium",
        icon: "⏰",
      });
    }

    // Motion sickness suggestions
    if (profile.motion_sickness === 'high') {
      const hasTransport = items.some(item => 
        item.transport_mode && ['bus', 'car', 'boat', 'train'].includes(item.transport_mode.toLowerCase())
      );

      if (hasTransport) {
        newSuggestions.push({
          category: "Travel Comfort",
          title: "Motion Sickness Prevention",
          description: "Take anti-nausea medication 30min before travel. Choose front seats in buses/cars. Pack ginger candies and keep eyes on horizon.",
          priority: "high",
          icon: "🚌",
        });
      }
    }

    // Claustrophobia suggestions
    if (profile.claustrophobia === 'high') {
      newSuggestions.push({
        category: "Space Management",
        title: "Avoid Crowded Times",
        description: "Visit popular attractions early morning or late evening. Book skip-the-line tickets. Choose outdoor activities when possible.",
        priority: "high",
        icon: "🏞️",
      });
    }

    // Heart sensitivity suggestions
    if (profile.heart_sensitivity === 'high') {
      newSuggestions.push({
        category: "Physical Activity",
        title: "Low-Impact Activity Schedule",
        description: "Avoid strenuous hiking or intense activities. Take frequent rest breaks. Stay hydrated and monitor heart rate.",
        priority: "high",
        icon: "❤️",
      });
    }

    // Hydration reminders
    if (profile.need_hydration_reminders) {
      newSuggestions.push({
        category: "Health",
        title: "Set Hydration Alarms",
        description: "Drink water every 2 hours, especially in hot weather. Carry reusable water bottle. Track 2-3L daily intake.",
        priority: "medium",
        icon: "💧",
      });
    }

    // Frequent breaks
    if (profile.need_frequent_breaks) {
      newSuggestions.push({
        category: "Energy Management",
        title: "Build in Rest Periods",
        description: "Schedule 20-30 minute breaks every 2-3 hours. Find quiet spots to recharge. Don't overschedule your days.",
        priority: "medium",
        icon: "☕",
      });
    }

    // Noise and crowd sensitivity
    newSuggestions.push({
      category: "Sensory Comfort",
      title: "Pack Comfort Items",
      description: "Bring noise-canceling headphones, sunglasses, comfortable shoes, and snacks. Create a 'calm kit' for overwhelming moments.",
      priority: "medium",
      icon: "🎧",
    });

    // Destination-specific suggestions
    if (destination.toLowerCase().includes('mountain') || destination.toLowerCase().includes('altitude')) {
      newSuggestions.push({
        category: "Altitude",
        title: "Acclimatization Plan",
        description: "Spend first 24-48 hours at lower elevation. Ascend gradually. Stay hydrated. Watch for altitude sickness symptoms.",
        priority: "high",
        icon: "⛰️",
      });
    }

    // AI-enhanced suggestions using Lovable AI
    try {
      const { data, error } = await supabase.functions.invoke('wellness-chat', {
        body: {
          message: `Based on this wellness profile: anxiety=${profile.anxiety}, motion_sickness=${profile.motion_sickness}, claustrophobia=${profile.claustrophobia}, generate 2 brief personalized travel tips for a ${tripDuration}-day trip to ${destination}. Keep each tip under 100 characters.`,
          type: 'suggest'
        }
      });

      if (!error && data?.suggestions) {
        data.suggestions.forEach((tip: string) => {
          newSuggestions.push({
            category: "AI Recommendation",
            title: "Personalized Tip",
            description: tip,
            priority: "low",
            icon: "✨",
          });
        });
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
    }

    setSuggestions(newSuggestions);
    setGenerating(false);
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="text-center py-8">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Complete your wellness profile to get personalized recommendations
          </p>
          <Button onClick={() => window.location.href = '/wellness'} variant="outline">
            Set Up Wellness Profile
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card border-2 border-primary/20 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Wellness AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Personalized trip optimizations</p>
          </div>
        </div>
        <Button 
          onClick={generateSuggestions} 
          variant="ghost" 
          size="sm"
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Wellness Profile Summary */}
      <div className="mb-6 p-4 rounded-xl bg-accent/20 border border-accent">
        <p className="text-xs font-medium text-muted-foreground mb-2">Your Wellness Profile</p>
        <div className="flex flex-wrap gap-2">
          {profile.anxiety === 'high' && (
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" /> Anxiety Management
            </Badge>
          )}
          {profile.motion_sickness === 'high' && (
            <Badge variant="outline" className="text-xs">
              <Wind className="w-3 h-3 mr-1" /> Motion Sensitive
            </Badge>
          )}
          {profile.claustrophobia === 'high' && (
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" /> Space Awareness
            </Badge>
          )}
          {profile.heart_sensitivity === 'high' && (
            <Badge variant="outline" className="text-xs">
              <Heart className="w-3 h-3 mr-1" /> Heart Care
            </Badge>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Generating personalized suggestions...</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                suggestion.priority === "high"
                  ? "bg-destructive/5 border-destructive/20"
                  : suggestion.priority === "medium"
                  ? "bg-warning/5 border-warning/20"
                  : "bg-info/5 border-info/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground">
                      {suggestion.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {suggestion.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
