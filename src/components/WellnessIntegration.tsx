import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WellnessIntegrationProps {
  destination: string;
  items: any[];
}

export const WellnessIntegration = ({ destination, items }: WellnessIntegrationProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchWellnessProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      generateAlerts();
    }
  }, [profile, items]);

  const fetchWellnessProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wellness_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setProfile(data);
  };

  const generateAlerts = () => {
    const newAlerts: string[] = [];

    if (profile.anxiety === 'high') {
      newAlerts.push('🧘 Consider scheduling downtime between activities for anxiety management');
    }

    if (profile.motion_sickness === 'high' && items.some(item => 
      item.transport_mode && ['bus', 'car', 'boat'].includes(item.transport_mode.toLowerCase())
    )) {
      newAlerts.push('🚌 Motion sickness alert: Bring medication and sit in front seats');
    }

    if (profile.altitude_sensitivity === 'high' && 
      destination.toLowerCase().includes('mountain')) {
      newAlerts.push('⛰️ High altitude destination: Plan acclimatization days');
    }

    if (profile.claustrophobia === 'high') {
      newAlerts.push('🚇 Claustrophobia alert: Avoid crowded metro during peak hours');
    }

    if (profile.heart_sensitivity === 'high') {
      newAlerts.push('❤️ Avoid strenuous activities, take frequent breaks');
    }

    if (profile.need_hydration_reminders) {
      newAlerts.push('💧 Set hydration reminders every 2 hours');
    }

    if (profile.need_frequent_breaks) {
      newAlerts.push('⏸️ Plan 15-min breaks every 2-3 hours');
    }

    setAlerts(newAlerts);
  };

  if (!profile || alerts.length === 0) return null;

  return (
    <Card className="glass-card p-6 hover-lift border-l-4 border-l-yellow-500">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Wellness & Health Alerts</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-yellow-500/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{alert}</p>
          </div>
        ))}

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 These alerts are personalized based on your wellness profile. 
            You can update your preferences in the Wellness section.
          </p>
        </div>
      </div>
    </Card>
  );
};
