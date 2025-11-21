import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, ArrowLeft, MapPin, Clock, User, Package, Calendar, MessageCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import ReportDialog from "@/components/ReportDialog";
import ShareButton from "@/components/ShareButton";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  pickup_location: string;
  available_until: string;
  available_from: string | null;
  status: string;
  created_at: string;
  donor_id: string;
  claimed_by: string | null;
  image_url: string | null;
  requested_by: string[] | null;
  request_status: string;
  profiles: {
    name: string;
    phone: string | null;
  };
}

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchListing();
    getCurrentUser();
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
        .select(`
          *,
          profiles!donor_id (
            name,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }

    setClaiming(true);
    try {
      const { error } = await supabase
        .from("food_listings")
        .update({
          request_status: "pending",
          requested_by: [...(listing?.requested_by || []), currentUserId],
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: listing!.donor_id,
        type: "request",
        title: "New Food Request",
        message: `Someone wants to claim your listing: ${listing!.title}`,
        listing_id: id,
      });

      toast({
        title: "Request Sent!",
        description: "The donor will be notified of your request.",
      });

      fetchListing();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleApproveRequest = async (requesterId: string) => {
    setClaiming(true);
    try {
      const { error } = await supabase
        .from("food_listings")
        .update({
          status: "claimed",
          claimed_by: requesterId,
          claimed_at: new Date().toISOString(),
          request_status: "approved",
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: requesterId,
        type: "approved",
        title: "Request Approved!",
        message: `Your request for "${listing!.title}" has been approved!`,
        listing_id: id,
      });

      toast({
        title: "Request Approved",
        description: "The receiver has been notified.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Leaf className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Listing not found</p>
          <Button onClick={() => navigate("/browse")}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  const isDonor = currentUserId === listing.donor_id;
  const isClaimed = listing.status === "claimed";
  const canClaim = !isDonor && !isClaimed && listing.status === "available";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
          <div className="flex items-center gap-2">
            {isDonor && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-listing/${listing.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <ShareButton listingId={listing.id} title={listing.title} />
              </>
            )}
            
            {!isDonor && currentUserId && (
              <>
                <ShareButton listingId={listing.id} title={listing.title} />
                <ReportDialog listingId={listing.id} userId={currentUserId} />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-border overflow-hidden">
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
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <Badge className="bg-success/10 text-success">{listing.category}</Badge>
                <Badge variant={isClaimed ? "secondary" : "default"}>
                  {listing.status}
                </Badge>
              </div>
              {isDonor && (
                <Button variant="outline" onClick={() => setShowQR(true)}>
                  Show QR Code
                </Button>
              )}
            </div>
            <CardTitle className="text-3xl">{listing.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{listing.quantity}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Shared by</p>
                    <p className="font-medium">{listing.profiles.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{listing.pickup_location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {listing.available_from && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pickup Available From</p>
                      <p className="font-medium">
                        {format(new Date(listing.available_from), "PPp")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Available Until</p>
                    <p className="font-medium">
                      {format(new Date(listing.available_until), "PPp")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium">
                      {format(new Date(listing.created_at), "PPp")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {!isDonor && listing.status === "available" && listing.request_status !== "pending" && (
                <Button onClick={handleRequest} size="lg" className="w-full" disabled={claiming}>
                  <Leaf className="mr-2 h-5 w-5" />
                  {claiming ? "Sending Request..." : "Request Food"}
                </Button>
              )}

              {!isDonor && listing.request_status === "pending" && listing.requested_by?.includes(currentUserId!) && (
                <Button disabled size="lg" className="w-full" variant="outline">
                  Request Pending
                </Button>
              )}

              {isDonor && listing.requested_by && listing.requested_by.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                      {listing.requested_by.length} user(s) want to claim this food
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {listing.requested_by.map((requesterId: string) => (
                      <div key={requesterId} className="flex items-center justify-between p-2 border rounded">
                        <span>User {requesterId.slice(0, 8)}...</span>
                        <Button size="sm" onClick={() => handleApproveRequest(requesterId)} disabled={claiming}>
                          {claiming ? "Approving..." : "Approve"}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {isClaimed && !isDonor && (
                <Button className="w-full" onClick={() => navigate(`/chat/${listing.donor_id}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Donor
                </Button>
              )}
              
              {isDonor && isClaimed && (
                <Button className="w-full" onClick={() => navigate(`/chat/${listing.claimed_by}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Receiver
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pickup Verification QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code to the receiver during pickup
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-6 bg-white">
              <QRCode value={`foodshare-pickup-${listing.id}`} size={256} />
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ListingDetail;
