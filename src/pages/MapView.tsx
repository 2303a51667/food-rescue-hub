import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, List, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Map from "@/components/Map";

interface FoodListing {
  id: string;
  title: string;
  category: string;
  pickup_location: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  status: string;
  profiles: {
    name: string;
    is_verified: boolean;
    organization_type: string;
  };
}

const MapView = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
        .select(`
          id,
          title,
          category,
          pickup_location,
          pickup_latitude,
          pickup_longitude,
          status,
          profiles!donor_id (
            name,
            is_verified,
            organization_type
          )
        `)
        .eq("status", "available")
        .gte("available_until", new Date().toISOString());

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <Leaf className="h-5 w-5 mr-2 text-primary" />
                Dashboard
              </Button>
              <span className="text-xl font-bold text-foreground">Map View</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/browse")}>
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
              <Button onClick={() => navigate("/create-listing")}>
                Share Food
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Nearby Food Donations</h2>
          <p className="text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {listings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground mb-2">No food available right now</p>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to share food in your community!
              </p>
              <Button onClick={() => navigate("/create-listing")}>
                Create First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border overflow-hidden">
            <Map
              listings={listings}
              onListingClick={(id) => navigate(`/listing/${id}`)}
            />
          </Card>
        )}
      </main>
    </div>
  );
};

export default MapView;
