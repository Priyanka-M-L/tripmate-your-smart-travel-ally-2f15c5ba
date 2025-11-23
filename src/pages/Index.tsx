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
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Compass className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground animate-scale-in">
            TripMate
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-semibold text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your AI-Powered Smart Travel Companion
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto text-muted-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Create personalized itineraries with weather forecasts, budget tracking, wellness insights, and interactive maps. Let AI handle the planning while you focus on the adventure.
          </p>
          <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-elegant hover-lift border-0 text-lg px-8"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Trip Form Section */}
      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Planning</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Plan Your Perfect Trip
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tell us about your dream destination and let our AI create a personalized itinerary with weather forecasts, budget tracking, and wellness insights
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl shadow-elegant border-2 border-border/50 hover-lift">
            <TripForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-foreground mb-16 animate-fade-in">
            Why Choose TripMate?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center animate-fade-in hover-lift glass-card p-8 rounded-2xl border-2 border-border/50" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-elegant">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">AI-Powered Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Smart algorithms create optimized itineraries with weather forecasts, budget tracking, and personalized wellness insights
              </p>
            </div>
            <div className="text-center animate-fade-in hover-lift glass-card p-8 rounded-2xl border-2 border-border/50" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-secondary mb-6 shadow-elegant">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Interactive Maps</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explore destinations with interactive maps showing routes, nearby places, and offline support for travel anywhere
              </p>
            </div>
            <div className="text-center animate-fade-in hover-lift glass-card p-8 rounded-2xl border-2 border-border/50" style={{ animationDelay: '0.3s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6 shadow-elegant">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Wellness Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get personalized recommendations based on your health profile, anxiety levels, and travel sensitivities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12 animate-fade-in">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <DestinationCard
                title="Tropical Paradise"
                image={beachImage}
                description="Crystal clear waters and pristine beaches await your discovery"
              />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <DestinationCard
                title="Mountain Adventures"
                image={mountainImage}
                description="Majestic peaks and breathtaking landscapes for the adventurous soul"
              />
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <DestinationCard
                title="Urban Exploration"
                image={cityImage}
                description="Vibrant cities filled with culture, cuisine, and endless excitement"
              />
            </div>
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
