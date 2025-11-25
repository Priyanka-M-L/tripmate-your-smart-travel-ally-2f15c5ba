import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EnhancedNavigation } from "@/components/EnhancedNavigation";
import { User, Mail, Calendar, Heart, LogOut, MapPin, Plane, Shield, Lock, Bell } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface ExtendedProfile {
  travelStyle: string;
  healthSensitivities: string[];
  dietaryPreferences: string;
  sleepSchedule: string;
  hydrationReminders: boolean;
  jetlagRecovery: string;
  totalTrips: number;
  favoriteDestinations: string;
  lastTripDate: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  
  // Extended profile data
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({
    travelStyle: "Adventure",
    healthSensitivities: [],
    dietaryPreferences: "",
    sleepSchedule: "Early Bird",
    hydrationReminders: true,
    jetlagRecovery: "Gradual",
    totalTrips: 0,
    favoriteDestinations: "",
    lastTripDate: "",
  });

  useEffect(() => {
    fetchUserData();
    loadExtendedProfile();
  }, []);

  const loadExtendedProfile = () => {
    const saved = localStorage.getItem("extendedProfile");
    if (saved) {
      try {
        setExtendedProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load extended profile:", e);
      }
    }
  };

  const saveExtendedProfile = () => {
    localStorage.setItem("extendedProfile", JSON.stringify(extendedProfile));
    toast.success("Preferences saved!");
  };

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFullName(data.full_name || "");
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;
      saveExtendedProfile();
      toast.success("Profile updated successfully!");
      fetchUserData();
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const toggleHealthSensitivity = (sensitivity: string) => {
    setExtendedProfile(prev => ({
      ...prev,
      healthSensitivities: prev.healthSensitivities.includes(sensitivity)
        ? prev.healthSensitivities.filter(s => s !== sensitivity)
        : [...prev.healthSensitivities, sensitivity]
    }));
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <EnhancedNavigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-card rounded-full shadow-elegant">
              <User className="w-8 h-8 text-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
          </div>

          {/* Profile Card */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-profile-turquoise to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-elegant">
                  {fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-profile-text">
                    {fullName || "Traveler"}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-bold text-profile-text">
                    <User className="w-4 h-4 text-profile-turquoise" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-gray-50 border-gray-200 text-profile-text placeholder:text-gray-400 focus:border-profile-turquoise focus:ring-profile-turquoise rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-bold text-profile-text">
                    <Mail className="w-4 h-4 text-profile-turquoise" />
                    Email
                  </Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-100 border-gray-200 text-gray-500 rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-bold text-profile-text">
                    <Calendar className="w-4 h-4 text-profile-turquoise" />
                    Member Since
                  </Label>
                  <Input
                    value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : "N/A"}
                    disabled
                    className="bg-gray-100 border-gray-200 text-gray-500 rounded-lg h-11"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full bg-profile-turquoise hover:bg-profile-turquoise/90 text-white shadow-soft hover:shadow-elegant transition-all duration-300 rounded-lg h-12 font-semibold"
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </Card>

          {/* Travel Summary */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <h3 className="text-xl font-bold text-profile-text mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-profile-turquoise" />
              Travel Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-profile-turquoise/10 to-blue-500/10 rounded-xl">
                <p className="text-3xl font-bold text-profile-turquoise">{extendedProfile.totalTrips}</p>
                <p className="text-sm text-gray-600 mt-1">Total Trips</p>
              </div>
              <div className="col-span-2 p-4 bg-gradient-to-br from-profile-coral/10 to-orange-500/10 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Favorite Destinations</p>
                <Input
                  value={extendedProfile.favoriteDestinations}
                  onChange={(e) => setExtendedProfile(prev => ({ ...prev, favoriteDestinations: e.target.value }))}
                  placeholder="Paris, Tokyo, New York..."
                  className="bg-white/50 border-gray-200 h-9"
                />
              </div>
            </div>
          </Card>

          {/* Travel Preferences */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <h3 className="text-xl font-bold text-profile-text mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-profile-turquoise" />
              Travel Preferences
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-profile-text">Travel Style</Label>
                <Select value={extendedProfile.travelStyle} onValueChange={(value) => setExtendedProfile(prev => ({ ...prev, travelStyle: value }))}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adventure">🏔️ Adventure</SelectItem>
                    <SelectItem value="Luxury">✨ Luxury</SelectItem>
                    <SelectItem value="Budget">💰 Budget</SelectItem>
                    <SelectItem value="Family">👨‍👩‍👧‍👦 Family</SelectItem>
                    <SelectItem value="Solo">🚶 Solo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-profile-text">Health Sensitivities</Label>
                <div className="flex flex-wrap gap-2">
                  {["Jetlag", "Motion Sickness", "Altitude", "Heat", "Cold"].map(sens => (
                    <Button
                      key={sens}
                      type="button"
                      variant={extendedProfile.healthSensitivities.includes(sens) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleHealthSensitivity(sens)}
                      className="h-9"
                    >
                      {sens}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-profile-text">Dietary Preferences</Label>
                <Input
                  value={extendedProfile.dietaryPreferences}
                  onChange={(e) => setExtendedProfile(prev => ({ ...prev, dietaryPreferences: e.target.value }))}
                  placeholder="Vegetarian, Vegan, Gluten-Free..."
                  className="bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>
          </Card>

          {/* Wellness Preferences */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <h3 className="text-xl font-bold text-profile-text mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-profile-turquoise" />
              Wellness Preferences
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-profile-text">Sleep Schedule</Label>
                <Select value={extendedProfile.sleepSchedule} onValueChange={(value) => setExtendedProfile(prev => ({ ...prev, sleepSchedule: value }))}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Early Bird">🌅 Early Bird (5-7 AM)</SelectItem>
                    <SelectItem value="Normal">☀️ Normal (7-9 AM)</SelectItem>
                    <SelectItem value="Night Owl">🦉 Night Owl (9-11 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-profile-turquoise" />
                  <div>
                    <p className="font-semibold text-profile-text">Hydration Reminders</p>
                    <p className="text-xs text-gray-500">Get notified to drink water</p>
                  </div>
                </div>
                <Switch
                  checked={extendedProfile.hydrationReminders}
                  onCheckedChange={(checked) => setExtendedProfile(prev => ({ ...prev, hydrationReminders: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-profile-text">Jetlag Recovery Strategy</Label>
                <Select value={extendedProfile.jetlagRecovery} onValueChange={(value) => setExtendedProfile(prev => ({ ...prev, jetlagRecovery: value }))}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gradual">🐌 Gradual Adjustment</SelectItem>
                    <SelectItem value="Immediate">⚡ Immediate Adaptation</SelectItem>
                    <SelectItem value="Natural">🌿 Natural Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={() => navigate("/wellness")}
              variant="outline"
              className="w-full mt-6 h-12 border-2 border-profile-turquoise text-profile-turquoise hover:bg-profile-turquoise hover:text-white"
            >
              Advanced Wellness Settings
            </Button>
          </Card>

          {/* Security Section */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <h3 className="text-xl font-bold text-profile-text mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-profile-turquoise" />
              Security
            </h3>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-left border-2"
              >
                <Lock className="w-5 h-5 mr-3 text-profile-turquoise" />
                <div>
                  <p className="font-semibold">Change Password</p>
                  <p className="text-xs text-gray-500">Update your login password</p>
                </div>
              </Button>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-profile-turquoise transition-all">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-profile-turquoise" />
                  <div>
                    <p className="font-semibold text-profile-text">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add extra security layer</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-8 bg-white border-0 shadow-elegant rounded-[16px]">
            <h3 className="text-xl font-bold text-profile-text mb-6">Account Actions</h3>
            <Button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-profile-coral hover:bg-profile-coral/90 text-white shadow-soft hover:shadow-elegant transition-all duration-300 rounded-lg h-12 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
