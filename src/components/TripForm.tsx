import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, DollarSign, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const TripForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: "",
    duration: "",
    budget: "",
    interests: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.duration || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      navigate("/itinerary", { 
        state: { 
          formData,
          timestamp: Date.now()
        } 
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2 text-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          Destination
        </Label>
        <Input
          id="destination"
          placeholder="e.g., Paris, France"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          required
          className="bg-card border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            Duration (days)
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            placeholder="e.g., 7"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
            className="bg-card border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            Budget (USD)
          </Label>
          <Input
            id="budget"
            type="number"
            min="0"
            placeholder="e.g., 2000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
            className="bg-card border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests" className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Interests & Preferences
        </Label>
        <Textarea
          id="interests"
          placeholder="e.g., culture, food, adventure, museums, nightlife..."
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          className="bg-card border-border min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-soft"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
            Generating Your Perfect Trip...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Itinerary
          </>
        )}
      </Button>
    </form>
  );
};
