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
    <div className="min-h-screen">
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Trips
          </h2>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="glass-card hover-lift bg-primary/90 hover:bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          <Card className="p-12 text-center glass-card animate-scale-in hover-lift">
            <Plane className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No trips yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start planning your next adventure!
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="glass-card hover-lift bg-primary/90 hover:bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Trip
            </Button>
          </Card>
        ) : (
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
