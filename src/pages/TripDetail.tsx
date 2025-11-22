import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ItineraryItemCard } from "@/components/ItineraryItemCard";
import { TripTimeline } from "@/components/TripTimeline";
import { CreateItineraryDialog } from "@/components/CreateItineraryDialog";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Navigation } from "@/components/Navigation";
import { SmartInsights } from "@/components/SmartInsights";
import { TripPlannerEnhanced } from "@/components/TripPlannerEnhanced";
import { TripMap } from "@/components/TripMap";
import { CarbonFootprintCard } from "@/components/CarbonFootprintCard";
import { PackingChecklist } from "@/components/PackingChecklist";
import { SafetyTips } from "@/components/SafetyTips";
import { LocalTransport } from "@/components/LocalTransport";
import { FoodAllergyPlanner } from "@/components/FoodAllergyPlanner";
import { SleepJetlagPlanner } from "@/components/SleepJetlagPlanner";
import { WellnessIntegration } from "@/components/WellnessIntegration";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ArrowLeft, Plus, Download, Sparkles, List, Calendar } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { 
  cacheTrip, 
  cacheItineraryItems, 
  getCachedTrip, 
  getCachedItineraryItems,
  isOnline,
  addPendingChange
} from "@/utils/offlineStorage";


interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  interests: string;
}

interface ItineraryItem {
  id: string;
  day_number: number;
  title: string;
  type: string;
  time: string;
  location: string;
  description: string;
  cost: number;
  carbon_footprint?: number;
  transport_mode?: string;
  transport_distance?: number;
}

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "list" | "timeline");
  };

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      // Try online first
      if (isOnline()) {
        const { data: tripData, error: tripError } = await supabase
          .from("trips")
          .select("*")
          .eq("id", id)
          .single();

        if (tripError) throw tripError;
        setTrip(tripData);
        await cacheTrip(tripData);

        const { data: itemsData, error: itemsError } = await supabase
          .from("itinerary_items")
          .select("*")
          .eq("trip_id", id)
          .order("day_number", { ascending: true })
          .order("time", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
        await cacheItineraryItems(itemsData || [], id!);
      } else {
        // Offline mode - use cached data
        const cachedTrip = await getCachedTrip(id!);
        const cachedItems = await getCachedItineraryItems(id!);
        
        if (cachedTrip) {
          setTrip(cachedTrip);
          setItems(cachedItems);
          toast.info("Viewing cached data (offline mode)");
        } else {
          throw new Error("No cached data available");
        }
      }
    } catch (error: any) {
      toast.error("Failed to load trip");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (isOnline()) {
        const { error } = await supabase
          .from("itinerary_items")
          .delete()
          .eq("id", itemId);
        if (error) throw error;
        toast.success("Item deleted");
      } else {
        // Offline mode - queue for sync
        await addPendingChange('delete', 'itinerary_items', { id: itemId });
        toast.info("Delete queued for sync");
      }
      fetchTripData();
    } catch (error: any) {
      toast.error("Failed to delete item");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  const generateAIItinerary = async () => {
    if (!trip) return;
    setGeneratingAI(true);

    try {
      const duration = Math.ceil(
        (new Date(trip.end_date).getTime() -
          new Date(trip.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const { data, error } = await supabase.functions.invoke(
        "generate-itinerary",
        {
          body: {
            destination: trip.destination,
            duration: duration,
            budget: trip.budget,
            interests: trip.interests,
          },
        }
      );

      if (error) throw error;

      // Insert AI-generated items
      const aiItems = data.itinerary.flatMap((day: any) =>
        day.items.map((item: any) => ({
          trip_id: trip.id,
          day_number: day.day,
          title: item.activity,
          type: item.activity.toLowerCase().includes("lunch") || 
                item.activity.toLowerCase().includes("dinner") || 
                item.activity.toLowerCase().includes("breakfast") ? "meal" : "activity",
          time: item.time || "09:00",
          location: item.location || trip.destination,
          description: item.description || "",
          cost: item.estimatedCost || 0,
          carbon_footprint: item.carbonFootprint || 0,
          transport_mode: item.transportMode || "walking",
          transport_distance: item.transportDistance || 0,
        }))
      );

      const { error: insertError } = await supabase
        .from("itinerary_items")
        .insert(aiItems);

      if (insertError) throw insertError;
      toast.success("AI itinerary generated!");
      fetchTripData();
    } catch (error: any) {
      toast.error("Failed to generate AI itinerary");
    } finally {
      setGeneratingAI(false);
    }
  };

  const exportToPDF = () => {
    const element = document.getElementById("trip-content");
    const opt = {
      margin: 0.5,
      filename: `${trip?.title || "trip"}-itinerary.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(element).save();
    toast.success("PDF downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading trip details..." />
      </div>
    );
  }

  if (!trip) return null;

  const tripDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const itemsByDay = items.reduce((acc, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  const totalSpent = items.reduce((sum, item) => sum + (item.cost || 0), 0);
  const totalCarbon = items.reduce((sum, item) => sum + (item.carbon_footprint || 0), 0);

  return (
    <div className="min-h-screen">
      <Navigation />
      <OfflineIndicator />
      
      <div className="bg-gradient-hero py-8 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              
              Back
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">{trip.title}</h1>
          <p className="text-lg text-muted-foreground">
            {trip.destination} • {tripDays} days
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8 animate-fade-in">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-primary hover:opacity-90 shadow-soft hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button 
            onClick={generateAIItinerary} 
            disabled={generatingAI}
            className="bg-secondary hover:opacity-90 shadow-soft hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingAI ? "Generating..." : "Generate AI Itinerary"}
          </Button>
          <Button 
            onClick={exportToPDF} 
            variant="outline"
            className="hover:scale-105 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        <div id="trip-content" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-3">
              <TripPlannerEnhanced
                destination={trip.destination}
                startDate={trip.start_date}
                endDate={trip.end_date}
                budget={trip.budget}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <BudgetTracker budget={trip.budget ?? 0} spent={totalSpent} />
            <CarbonFootprintCard totalCarbonKg={totalCarbon} />
            <PackingChecklist 
              destination={trip.destination} 
              duration={tripDays}
              weather={items.length > 0 ? "Check forecast above" : undefined}
            />
          </div>

          {items.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <WellnessIntegration destination={trip.destination} items={items} />
            </div>
          )}

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <SmartInsights 
              destination={trip.destination}
              startDate={trip.start_date}
              interests={trip.interests}
            />
          </div>

          {items.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <TripMap items={items} destination={trip.destination} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <SafetyTips destination={trip.destination} />
            <LocalTransport destination={trip.destination} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <FoodAllergyPlanner destination={trip.destination} />
            <SleepJetlagPlanner 
              destination={trip.destination} 
              startDate={trip.start_date}
              duration={tripDays}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Itinerary
              </h2>
            </div>
            
            {items.length === 0 ? (
              <Card className="p-8 text-center glass-card animate-scale-in">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-float" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Your Itinerary is Empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start building your perfect trip! You can either add activities manually or let our AI create a complete itinerary for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setDialogOpen(true)}
                    className="gap-2 glass-card hover-lift bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity Manually
                  </Button>
                  <Button 
                    onClick={generateAIItinerary} 
                    disabled={generatingAI}
                    className="bg-secondary/90 hover:bg-secondary gap-2 glass-card hover-lift text-secondary-foreground"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generatingAI ? "Generating..." : "Generate AI Itinerary"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Tabs value={viewMode} onValueChange={handleViewModeChange}>
                <TabsList className="mb-6 glass-card">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <div className="space-y-6">
                    {Array.from({ length: tripDays }, (_, i) => i + 1).map(
                      (day) => (
                        <Card 
                          key={day} 
                          className="p-6 glass-card hover-lift"
                        >
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            Day {day}
                          </h3>
                          <div className="space-y-4">
                            {itemsByDay[day]?.map((item) => (
                              <ItineraryItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDeleteItem}
                              />
                            )) || (
                              <p className="text-muted-foreground text-sm">
                                No activities for this day
                              </p>
                            )}
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="timeline">
                  <TripTimeline items={items} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      <CreateItineraryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tripId={trip.id}
        maxDay={tripDays}
        onItemCreated={fetchTripData}
      />
    </div>
  );
};

export default TripDetail;
