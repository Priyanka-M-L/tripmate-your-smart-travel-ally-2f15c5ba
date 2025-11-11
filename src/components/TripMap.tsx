import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Map } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TripMapProps {
  items: Array<{
    id: string;
    title: string;
    location: string;
  }>;
}

export const TripMap = ({ items }: TripMapProps) => {
  // Default position (Paris)
  const defaultPosition: [number, number] = [48.8566, 2.3522];

  // For simplicity, using the default position for all markers
  // In production, you'd geocode each location
  const markers = items
    .filter((item) => item.location)
    .map((item) => ({
      position: defaultPosition,
      title: item.title,
      location: item.location,
    }));

  if (markers.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Map View</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Add locations to your itinerary items to see them on the map
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Map View</h3>
      </div>
      <div className="h-[400px] rounded-lg overflow-hidden">
        <MapContainer
          center={defaultPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker, idx) => (
            <Marker key={idx} position={marker.position}>
              <Popup>
                <strong>{marker.title}</strong>
                <br />
                {marker.location}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Card>
  );
};
