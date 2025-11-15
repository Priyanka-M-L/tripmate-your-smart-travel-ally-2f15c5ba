import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TripForm } from "@/components/TripForm";
import { DestinationCard } from "@/components/DestinationCard";
import { Compass, Sparkles, Globe, Shield, LogIn, Plane } from "lucide-react";
import heroImage from "@/assets/hero-travel.jpg";
import beachImage from "@/assets/destination-beach.jpg";
import mountainImage from "@/assets/destination-mountain.jpg";
import cityImage from "@/assets/destination-city.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plane className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">TripMate</h1>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            variant="default"
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Compass className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            TripMate
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-foreground">
            Your AI-Powered Smart Travel Companion
          </p>
          <p className="text-lg mb-8 max-w-xl mx-auto text-muted-foreground">
            Create personalized itineraries in seconds. Let AI handle the planning while you focus on the adventure.
          </p>
        </div>
      </section>

      {/* Trip Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Plan Your Perfect Trip
            </h2>
            <p className="text-muted-foreground text-lg">
              Tell us about your dream destination and let our AI create a personalized itinerary
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-soft border border-border">
            <TripForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Choose TripMate?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered Planning</h3>
              <p className="text-muted-foreground">
                Smart algorithms create optimized itineraries based on your preferences and budget
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Worldwide Destinations</h3>
              <p className="text-muted-foreground">
                Explore any destination with personalized recommendations and local insights
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Time & Money Saver</h3>
              <p className="text-muted-foreground">
                Save hours of research and get the most value from your travel budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <DestinationCard
              title="Tropical Paradise"
              image={beachImage}
              description="Crystal clear waters and pristine beaches await your discovery"
            />
            <DestinationCard
              title="Mountain Adventures"
              image={mountainImage}
              description="Majestic peaks and breathtaking landscapes for the adventurous soul"
            />
            <DestinationCard
              title="Urban Exploration"
              image={cityImage}
              description="Vibrant cities filled with culture, cuisine, and endless excitement"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 TripMate. Your intelligent travel companion.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
