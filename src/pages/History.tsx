import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, ArrowLeft, Package, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HistoryListing {
  id: string;
  title: string;
  category: string;
  quantity: string;
  status: string;
  created_at: string;
  claimed_at: string | null;
  available_until: string;
  profiles?: {
    name: string;
  };
}

const History = () => {
  const [donated, setDonated] = useState<HistoryListing[]>([]);
  const [received, setReceived] = useState<HistoryListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      await fetchHistory(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const fetchHistory = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch donated items
      const { data: donatedData, error: donatedError } = await supabase
        .from("food_listings")
        .select("*")
        .eq("donor_id", userId)
        .order("created_at", { ascending: false });

      if (donatedError) throw donatedError;

      // Fetch received items
      const { data: receivedData, error: receivedError } = await supabase
        .from("food_listings")
        .select(`
          *,
          profiles!donor_id (name)
        `)
        .eq("claimed_by", userId)
        .order("claimed_at", { ascending: false });

      if (receivedError) throw receivedError;

      setDonated(donatedData || []);
      setReceived(receivedData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      available: "bg-success/10 text-success",
      claimed: "bg-warning/10 text-warning",
      completed: "bg-primary/10 text-primary",
      expired: "bg-muted text-muted-foreground",
    };
    return colors[status] || colors.available;
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="h-4 w-4" />;
    if (status === "claimed") return <Clock className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  const renderListingCard = (listing: HistoryListing, isDonated: boolean) => (
    <Card
      key={listing.id}
      className="border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/listing/${listing.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
            {!isDonated && listing.profiles && (
              <p className="text-sm text-muted-foreground">
                From: {listing.profiles.name}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(listing.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(listing.status)}
              {listing.status}
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium capitalize">{listing.category}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Quantity</p>
            <p className="font-medium">{listing.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {isDonated ? "Listed" : "Claimed"}
            </p>
            <p className="font-medium">
              {format(
                new Date(isDonated ? listing.created_at : listing.claimed_at!),
                "MMM dd, yyyy"
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expired</p>
            <p className="font-medium">
              {format(new Date(listing.available_until), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                Activity History
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="donated" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="donated">
              Donated ({donated.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              Received ({received.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="donated">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Foods You've Donated</CardTitle>
              </CardHeader>
              <CardContent>
                {donated.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No donations yet</p>
                    <Button
                      onClick={() => navigate("/create-listing")}
                      className="mt-4"
                    >
                      Share Food
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donated.map((listing) => renderListingCard(listing, true))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="received">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Foods You've Received</CardTitle>
              </CardHeader>
              <CardContent>
                {received.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No received items yet</p>
                    <Button onClick={() => navigate("/browse")} className="mt-4">
                      Browse Food
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {received.map((listing) =>
                      renderListingCard(listing, false)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default History;
