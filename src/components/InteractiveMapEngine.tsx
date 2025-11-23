import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, Navigation, Coffee, ShoppingBag, 
  Hospital, AlertCircle, Loader2, Layers
} from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${icon}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface MapItem {
  id: string;
  title: string;
  location: string;
  time: string;
  cost: number;
  day_number: number;
  type: string;
}

interface NearbyPlace {
  name: string;
  category: string;
  lat: number;
  lon: number;
}

interface InteractiveMapEngineProps {
  items: MapItem[];
  destination: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const InteractiveMapEngine = ({ items, destination }: InteractiveMapEngineProps) => {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [markers, setMarkers] = useState<Array<{ lat: number; lon: number; item: MapItem }>>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNearby, setShowNearby] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    geocodeLocations();
  }, [items, destination]);

  const geocodeLocations = async () => {
    setLoading(true);
    try {
      // Geocode main destination
      const destResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
      );
      const destData = await destResponse.json();

      if (destData.results && destData.results.length > 0) {
        const { latitude, longitude } = destData.results[0];
        setCenter([latitude, longitude]);

        // Try to load from cache first (offline support)
        const cached = localStorage.getItem(`map_cache_${destination}`);
        if (cached) {
          const cachedData = JSON.parse(cached);
          setMarkers(cachedData.markers);
          setOfflineMode(true);
        }

        // Geocode each itinerary item
        const geocodedMarkers = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                  item.location || destination
                )}&count=1&language=en&format=json`
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                return {
                  lat: data.results[0].latitude,
                  lon: data.results[0].longitude,
                  item,
                };
              }
            } catch (error) {
              console.error(`Failed to geocode ${item.location}:`, error);
            }
            return null;
          })
        );

        const validMarkers = geocodedMarkers.filter((m) => m !== null) as Array<{
          lat: number;
          lon: number;
          item: MapItem;
        }>;

        setMarkers(validMarkers);

        // Cache for offline use
        localStorage.setItem(
          `map_cache_${destination}`,
          JSON.stringify({ markers: validMarkers, timestamp: Date.now() })
        );
        setOfflineMode(false);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Try to load from cache
      const cached = localStorage.getItem(`map_cache_${destination}`);
      if (cached) {
        const cachedData = JSON.parse(cached);
        setMarkers(cachedData.markers);
        setOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async () => {
    if (markers.length === 0) return;

    setShowNearby(true);
    const [lat, lon] = center;

    // Using Overpass API to find nearby POIs
    const categories = [
      { query: "amenity=cafe", icon: "☕", name: "Cafes" },
      { query: "amenity=restaurant", icon: "🍽️", name: "Restaurants" },
      { query: "amenity=hospital", icon: "🏥", name: "Hospitals" },
      { query: "amenity=pharmacy", icon: "💊", name: "Pharmacies" },
      { query: "amenity=atm", icon: "🏧", name: "ATMs" },
      { query: "amenity=police", icon: "🚔", name: "Police" },
    ];

    try {
      const radius = 1000; // 1km radius
      const overpassQuery = `
        [out:json];
        (
          ${categories.map(c => `node["${c.query}"](around:${radius},${lat},${lon});`).join('')}
        );
        out body 10;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });

      const data = await response.json();
      
      const places: NearbyPlace[] = data.elements.map((element: any) => ({
        name: element.tags.name || 'Unknown',
        category: element.tags.amenity,
        lat: element.lat,
        lon: element.lon,
      }));

      setNearbyPlaces(places.slice(0, 15)); // Limit to 15 places
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    }
  };

  // Generate route line between markers (sorted by day and time)
  const routeCoordinates: [number, number][] = markers
    .sort((a, b) => {
      if (a.item.day_number !== b.item.day_number) {
        return a.item.day_number - b.item.day_number;
      }
      return a.item.time.localeCompare(b.item.time);
    })
    .map((m) => [m.lat, m.lon] as [number, number]);

  if (loading) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (markers.length === 0 && items.length === 0) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Add locations to your itinerary items to see them on the map
          </p>
        </div>
      </Card>
    );
  }

  if (markers.length === 0 && items.length > 0) {
    return (
      <Card className="p-6 glass-card border-2 border-border/50">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Geocoding {items.length} location{items.length > 1 ? 's' : ''}...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card border-2 border-border/50 hover-lift overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Interactive Trip Map</h3>
            <p className="text-xs text-muted-foreground">
              {markers.length} locations • {destination}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offlineMode && (
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Offline Mode
            </Badge>
          )}
          <Button
            onClick={fetchNearbyPlaces}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Layers className="w-4 h-4 mr-1" />
            {showNearby ? "Hide" : "Show"} Nearby
          </Button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border-2 border-border/50 shadow-elegant">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "500px", width: "100%" }}
          className="z-0"
        >
          <MapUpdater center={center} zoom={12} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route visualization */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
              dashArray="5, 10"
            />
          )}

          {/* Itinerary markers */}
          {markers.map((marker, index) => {
            const icon = marker.item.type === "meal" ? "🍽️" : 
                        marker.item.type === "hotel" ? "🏨" : 
                        marker.item.type === "activity" ? "🎯" : "📍";
            
            return (
              <Marker
                key={marker.item.id}
                position={[marker.lat, marker.lon]}
                icon={createCustomIcon("#3b82f6", icon)}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <p className="font-bold text-sm mb-1">{marker.item.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Day {marker.item.day_number} • {marker.item.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📍 {marker.item.location}
                    </p>
                    {marker.item.cost > 0 && (
                      <p className="text-xs font-medium text-primary mt-1">
                        ${marker.item.cost}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Nearby places markers */}
          {showNearby && nearbyPlaces.map((place, index) => {
            const icon = place.category === "cafe" ? "☕" :
                        place.category === "restaurant" ? "🍽️" :
                        place.category === "hospital" ? "🏥" :
                        place.category === "pharmacy" ? "💊" :
                        place.category === "atm" ? "🏧" :
                        place.category === "police" ? "🚔" : "📍";

            return (
              <Marker
                key={`nearby-${index}`}
                position={[place.lat, place.lon]}
                icon={createCustomIcon("#10b981", icon)}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-xs mb-1">{place.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {place.category}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">
          <span className="mr-1">📍</span> Activities
        </Badge>
        <Badge variant="outline" className="text-xs">
          <span className="mr-1">🍽️</span> Meals
        </Badge>
        <Badge variant="outline" className="text-xs">
          <span className="mr-1">🏨</span> Hotels
        </Badge>
        {showNearby && (
          <>
            <Badge variant="outline" className="text-xs bg-success/10">
              <span className="mr-1">☕</span> Cafes
            </Badge>
            <Badge variant="outline" className="text-xs bg-success/10">
              <span className="mr-1">🏥</span> Emergency
            </Badge>
          </>
        )}
      </div>
    </Card>
  );
};
