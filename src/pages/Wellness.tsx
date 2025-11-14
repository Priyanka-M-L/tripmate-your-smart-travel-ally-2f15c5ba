import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Plane, Brain, Activity, Wind, Mountain, Smile, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface WellnessProfile {
  motion_sickness: string;
  fear_of_flights: string;
  anxiety: string;
  vomiting_tendency: string;
  heart_sensitivity: string;
  claustrophobia: string;
  altitude_sensitivity: string;
  mood_issues: string;
  mental_wellness: string;
  avoid_flights: boolean;
  prefer_window_seat: boolean;
  prefer_aisle_seat: boolean;
  need_frequent_breaks: boolean;
  need_hydration_reminders: boolean;
  need_calming_notifications: boolean;
  need_medical_alerts: boolean;
  need_customized_destinations: boolean;
}

const conditions = [
  { key: "motion_sickness", label: "Motion Sickness", icon: Activity },
  { key: "fear_of_flights", label: "Fear of Flying", icon: Plane },
  { key: "anxiety", label: "Anxiety", icon: Brain },
  { key: "vomiting_tendency", label: "Vomiting Tendency", icon: AlertCircle },
  { key: "heart_sensitivity", label: "Heart Sensitivity", icon: Heart },
  { key: "claustrophobia", label: "Claustrophobia", icon: Wind },
  { key: "altitude_sensitivity", label: "High-Altitude Sensitivity", icon: Mountain },
  { key: "mood_issues", label: "Mood Issues", icon: Smile },
  { key: "mental_wellness", label: "Mental Wellness Concerns", icon: Brain },
];

const preferences = [
  { key: "avoid_flights", label: "Avoid Flights" },
  { key: "prefer_window_seat", label: "Prefer Window Seat" },
  { key: "prefer_aisle_seat", label: "Prefer Aisle Seat" },
  { key: "need_frequent_breaks", label: "Need Frequent Breaks" },
  { key: "need_hydration_reminders", label: "Need Hydration Reminders" },
  { key: "need_calming_notifications", label: "Need Calming Notifications" },
  { key: "need_medical_alerts", label: "Need Medical Alert Options" },
  { key: "need_customized_destinations", label: "Need Customized Destination Suggestions" },
];

const Wellness = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<WellnessProfile>({
    motion_sickness: "none",
    fear_of_flights: "none",
    anxiety: "none",
    vomiting_tendency: "none",
    heart_sensitivity: "none",
    claustrophobia: "none",
    altitude_sensitivity: "none",
    mood_issues: "none",
    mental_wellness: "none",
    avoid_flights: false,
    prefer_window_seat: false,
    prefer_aisle_seat: false,
    need_frequent_breaks: false,
    need_hydration_reminders: false,
    need_calming_notifications: false,
    need_medical_alerts: false,
    need_customized_destinations: false,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      await fetchWellnessProfile(user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchWellnessProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("wellness_profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile(data as WellnessProfile);
      }
    } catch (error) {
      console.error("Error fetching wellness profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your wellness profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      const { data: existing } = await supabase
        .from("wellness_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("wellness_profiles")
          .update(profile)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wellness_profiles")
          .insert({ ...profile, user_id: userId });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Your wellness preferences have been saved.",
      });
    } catch (error) {
      console.error("Error saving wellness profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your wellness profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCondition = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updatePreference = (key: string, value: boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-profile-gradient-start via-profile-gradient-mid to-profile-gradient-end">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-profile-gradient-start via-profile-gradient-mid to-profile-gradient-end py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Travel Wellness & Support</h1>
          <p className="text-white/80">Help us personalize your travel experience for your comfort and wellbeing</p>
        </div>

        <Card className="p-8 mb-6 bg-white shadow-xl rounded-2xl">
          <h2 className="text-2xl font-bold text-profile-text mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-profile-button" />
            Health & Emotional Sensitivities
          </h2>
          <p className="text-profile-text/70 mb-6">
            Select the severity of any conditions that affect your travel comfort
          </p>

          <div className="space-y-6">
            {conditions.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-profile-button" />
                  <Label className="text-profile-text font-medium">{label}</Label>
                </div>
                <Select
                  value={profile[key as keyof WellnessProfile] as string}
                  onValueChange={(value) => updateCondition(key, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-white shadow-xl rounded-2xl">
          <h2 className="text-2xl font-bold text-profile-text mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-profile-button" />
            Travel Preferences & Support
          </h2>
          <p className="text-profile-text/70 mb-6">
            Choose the accommodations and support features that work best for you
          </p>

          <div className="space-y-4">
            {preferences.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-3">
                <Label className="text-profile-text">{label}</Label>
                <Switch
                  checked={profile[key as keyof WellnessProfile] as boolean}
                  onCheckedChange={(checked) => updatePreference(key, checked)}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4 items-center mt-8">
          <Button
            onClick={() => navigate("/wellness-chat")}
            className="bg-gradient-to-r from-profile-button to-blue-500 text-white hover:from-profile-button/90 hover:to-blue-500/90 px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            💬 Chat with Wellness Assistant
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-profile-button text-white hover:bg-profile-button/90 px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            {saving ? "Saving..." : "Save Wellness Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wellness;
