import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TripCard } from "@/components/TripCard";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { Navigation } from "@/components/Navigation";
import { Plus, Plane } from "lucide-react";
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
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-hero py-16 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              My Trips
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Plan, organize, and track all your adventures in one place
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-elegant hover-lift border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {trips.length === 0 ? (
          <Card className="p-16 text-center glass-card border-2 border-border/50 animate-scale-in hover-lift max-w-2xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-elegant">
              <Plane className="w-12 h-12 text-white animate-float" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              No trips yet
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Start planning your next adventure with AI-powered itineraries, weather forecasts, and smart budget tracking!
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-elegant hover-lift border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Trip
            </Button>
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
