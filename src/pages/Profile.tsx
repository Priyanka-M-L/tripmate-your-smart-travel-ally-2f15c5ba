import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plane, User, LogOut, ArrowLeft, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

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
      toast.success("Profile updated successfully!");
      fetchUserData();
    } catch (error: any) {
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
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
    <div className="min-h-screen bg-gradient-profile">
      {/* Header */}
      <header className="bg-transparent backdrop-blur-sm text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Plane className="w-8 h-8" />
                <h1 className="text-3xl font-bold">TripMate</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white rounded-full shadow-elegant">
              <User className="w-8 h-8 text-profile-text" />
            </div>
            <h2 className="text-3xl font-bold text-white">My Profile</h2>
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
                    value={new Date(profile?.created_at || "").toLocaleDateString()}
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
