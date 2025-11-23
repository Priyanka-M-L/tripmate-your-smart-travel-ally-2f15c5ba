import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Navigation, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface GoogleMapEngineProps {
  items: Array<{
    id: string;
    title: string;
    location: string;
    time?: string;
    cost?: number;
  }>;
  destination: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

export const GoogleMapEngine = ({ items, destination }: GoogleMapEngineProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Back online - refreshing map");
      initializeMap();
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Offline mode - showing cached map");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to your environment.");
      setLoading(false);
      return;
    }

    // Check if script already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    script.onerror = () => {
      setError("Failed to load Google Maps. Check your API key and billing settings.");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [destination, items]);

  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    if (!window.google?.maps) return null;

    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode(
        { address: `${locationName}, ${destination}` },
        (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            console.error(`Geocoding failed for ${locationName}:`, status);
            resolve(null);
          }
        }
      );
    });
  };

  const initializeMap = async () => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      setLoading(true);

      // Geocode destination for map center
      const centerCoords = await geocodeLocation(destination);
      if (!centerCoords) {
        setError("Could not find destination location");
        setLoading(false);
        return;
      }

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: centerCoords,
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
      });

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for itinerary items
      const bounds = new window.google.maps.LatLngBounds();
      
      for (const item of items) {
        if (!item.location) continue;

        const coords = await geocodeLocation(item.location);
        if (!coords) continue;

        const position = new window.google.maps.LatLng(coords.lat, coords.lng);
        
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: item.title,
          animation: window.google.maps.Animation.DROP,
        });

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <strong style="font-size: 14px;">${item.title}</strong><br/>
              <span style="font-size: 12px; color: #666;">${item.location}</span>
              ${item.time ? `<br/><span style="font-size: 12px;">🕐 ${item.time}</span>` : ''}
              ${item.cost ? `<br/><span style="font-size: 12px;">💰 $${item.cost}</span>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      }

      // Fit map to show all markers
      if (markersRef.current.length > 0) {
        map.fitBounds(bounds);
      }

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Interactive Map</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Reload Page
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Interactive Map</h3>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Interactive Map</h3>
        </div>
        {isOffline && (
          <div className="flex items-center gap-2 text-xs text-warning">
            <AlertCircle className="w-4 h-4" />
            Offline Mode
          </div>
        )}
      </div>
      <div 
        ref={mapRef} 
        className="h-[500px] rounded-lg overflow-hidden shadow-soft"
        style={{ minHeight: '500px' }}
      />
    </Card>
  );
};
