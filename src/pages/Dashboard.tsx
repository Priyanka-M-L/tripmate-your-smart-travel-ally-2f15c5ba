import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TripCard } from "@/components/TripCard";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { EnhancedNavigation } from "@/components/EnhancedNavigation";
import { Plus, Plane, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  interests: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchTrips();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw error;
      toast.success("Trip deleted");
      fetchTrips();
    } catch (error: any) {
      toast.error("Failed to delete trip");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading your trips..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation />

      {/* Hero Header */}
      <div className="relative bg-gradient-hero py-20 border-b border-border/50 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Travel Hub</span>
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              My Trips
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Plan, organize, and track all your adventures with AI-powered insights
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-sunset hover:opacity-90 shadow-glow hover-lift border-0 text-lg px-8 py-6"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {trips.length === 0 ? (
          <Card className="relative p-20 text-center glass-card border-2 border-border/50 animate-scale-in hover-lift max-w-3xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
            <div className="relative z-10">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-sunset rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-sunset flex items-center justify-center mx-auto shadow-glow">
                  <Plane className="w-16 h-16 text-white animate-float" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Ready for your next adventure?
              </h3>
              <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
                Start planning with AI-powered itineraries, live weather updates, interactive maps, and smart wellness tracking!
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                size="lg"
                className="bg-gradient-sunset hover:opacity-90 shadow-glow hover-lift border-0 text-lg px-8 py-6"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create Your First Trip
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">All Trips</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, index) => (
                <div 
                  key={trip.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TripCard
                    trip={trip}
                    onDelete={handleDeleteTrip}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <CreateTripDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTripCreated={fetchTrips}
      />
    </div>
  );
};

export default Dashboard;
