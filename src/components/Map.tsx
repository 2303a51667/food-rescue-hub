import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MapProps {
  listings: Array<{
    id: string;
    title: string;
    pickup_location: string;
    pickup_latitude?: number | null;
    pickup_longitude?: number | null;
    category: string;
  }>;
  onListingClick?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

const Map = ({ listings, onListingClick, center = [78.9629, 20.5937], zoom = 5 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation || center,
      zoom: userLocation ? 12 : zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add user location marker
    if (userLocation) {
      new mapboxgl.Marker({ color: "#2ecc71" })
        .setLngLat(userLocation)
        .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
        .addTo(map.current);
    }

    // Add markers for listings with coordinates
    listings.forEach((listing) => {
      if (listing.pickup_latitude && listing.pickup_longitude && map.current) {
        const marker = new mapboxgl.Marker({ color: "#f39c12" })
          .setLngLat([listing.pickup_longitude, listing.pickup_latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div class="p-2">
                <h3 class="font-bold">${listing.title}</h3>
                <p class="text-sm">${listing.category}</p>
                <p class="text-sm text-gray-600">${listing.pickup_location}</p>
              </div>`
            )
          )
          .addTo(map.current);

        marker.getElement().addEventListener("click", () => {
          if (onListingClick) {
            onListingClick(listing.id);
          }
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, listings, center, zoom, userLocation, onListingClick]);

  const handleGetDirections = (listing: any) => {
    if (userLocation && listing.pickup_latitude && listing.pickup_longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${listing.pickup_latitude},${listing.pickup_longitude}`;
      window.open(url, "_blank");
    } else {
      toast({
        title: "Location required",
        description: "Please enable location access to get directions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {!mapboxToken ? (
        <Card className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Mapbox public token to view the map
          </p>
          <input
            type="text"
            placeholder="Mapbox public token (pk.xxx...)"
            className="w-full max-w-md px-4 py-2 border border-border rounded-md mb-4"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your token at{" "}
            <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              mapbox.com
            </a>
          </p>
        </Card>
      ) : (
        <>
          <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
          {userLocation && (
            <Button
              size="sm"
              className="absolute bottom-4 left-4 z-10"
              onClick={() => {
                if (map.current && userLocation) {
                  map.current.flyTo({ center: userLocation, zoom: 13 });
                }
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              My Location
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default Map;
