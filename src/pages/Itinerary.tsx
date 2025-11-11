import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ItineraryCard } from "@/components/ItineraryCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ItineraryDay {
  day: number;
  items: Array<{
    time?: string;
    activity: string;
    location?: string;
    description?: string;
  }>;
}

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [tripDetails, setTripDetails] = useState<any>(null);

  useEffect(() => {
    const generateItinerary = async () => {
      const formData = location.state?.formData;
      
      if (!formData) {
        toast.error("No trip data found");
        navigate("/");
        return;
      }

      setTripDetails(formData);
      setIsLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke('generate-itinerary', {
          body: { 
            destination: formData.destination,
            duration: parseInt(formData.duration),
            budget: parseFloat(formData.budget),
            interests: formData.interests
          }
        });

        if (error) throw error;

        if (data?.itinerary) {
          setItinerary(data.itinerary);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error: any) {
        console.error("Error generating itinerary:", error);
        toast.error(error.message || "Failed to generate itinerary. Please try again.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    generateItinerary();
  }, [location, navigate]);

  const handleShare = () => {
    toast.success("Share feature coming soon!");
  };

  const handleDownload = () => {
    toast.success("Download feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Crafting your perfect itinerary with AI..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">Your Personalized Itinerary</h1>
          {tripDetails && (
            <div className="flex flex-wrap gap-4 text-sm">
              <span>📍 {tripDetails.destination}</span>
              <span>📅 {tripDetails.duration} days</span>
              <span>💰 ${tripDetails.budget}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Itinerary Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {itinerary.map((day) => (
            <ItineraryCard key={day.day} day={day.day} items={day.items} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
