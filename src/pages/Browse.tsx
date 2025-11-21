import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Leaf, MapPin, Clock, User, Filter, Map as MapIcon, Search, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VerifiedBadge from "@/components/VerifiedBadge";
import ShelfLifeIndicator from "@/components/ShelfLifeIndicator";

interface FoodListing {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  pickup_location: string;
  available_until: string;
  status: string;
  created_at: string;
  image_url: string | null;
  shelf_life_status: string;
  quality_rating: number | null;
  profiles: {
    name: string;
    is_verified: boolean;
    organization_type: string;
  };
}

const Browse = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [shelfLifeFilter, setShelfLifeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = listings;

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(l => l.category === categoryFilter);
    }

    // Shelf life filter
    if (shelfLifeFilter !== "all") {
      filtered = filtered.filter(l => l.shelf_life_status === shelfLifeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.pickup_location.toLowerCase().includes(query)
      );
    }

    setFilteredListings(filtered);
  }, [categoryFilter, shelfLifeFilter, searchQuery, listings]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
        .select(`
          *,
          profiles!donor_id (
            name,
            is_verified,
            organization_type
          )
        `)
        .eq("status", "available")
        .gte("available_until", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
      setFilteredListings(data || []);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours left`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days left`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      vegetables: "bg-success/10 text-success",
      fruits: "bg-secondary/10 text-secondary",
      bakery: "bg-warning/10 text-warning",
      dairy: "bg-accent/10 text-accent",
      meals: "bg-primary/10 text-primary",
      packaged: "bg-muted text-muted-foreground",
      other: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading listings...</p>
        </div>
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
              <span className="text-xl font-bold text-foreground">Browse Food</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/community")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Community
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/map")}>
                <MapIcon className="h-4 w-4 mr-2" />
                Map View
              </Button>
              <Button onClick={() => navigate("/create-listing")}>
                Share Food
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="meals">Prepared Meals</SelectItem>
                <SelectItem value="packaged">Packaged Foods</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={shelfLifeFilter} onValueChange={setShelfLifeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Freshness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Freshness</SelectItem>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expiring_today">Expiring Today</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="border-border hover:shadow-lg transition-shadow overflow-hidden">
                {listing.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getCategoryColor(listing.category)}>
                        {listing.category}
                      </Badge>
                      <ShelfLifeIndicator
                        status={listing.shelf_life_status}
                        availableUntil={listing.available_until}
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(listing.available_until)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {listing.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{listing.profiles.name}</span>
                    <VerifiedBadge 
                      isVerified={listing.profiles.is_verified}
                      organizationType={listing.profiles.organization_type}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{listing.pickup_location}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    Quantity: {listing.quantity}
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
