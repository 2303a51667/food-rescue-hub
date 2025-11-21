import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Leaf, ArrowLeft, Award, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import VerifiedBadge from "@/components/VerifiedBadge";

interface Activity {
  id: string;
  activity_type: string;
  created_at: string;
  profiles: {
    name: string;
    is_verified: boolean;
    organization_type: string;
  };
  food_listings: {
    title: string;
    category: string;
  } | null;
}

interface TopSharer {
  user_id: string;
  name: string;
  is_verified: boolean;
  organization_type: string;
  meals_shared: number;
}

const CommunityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topSharers, setTopSharers] = useState<TopSharer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for community activities
    const channel = supabase
      .channel('community-activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_activities'
        },
        (payload) => {
          console.log('New community activity:', payload);
          // Refresh the feed to show new activity
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("community_activities")
        .select(`
          id,
          activity_type,
          created_at,
          user_id,
          listing_id
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (activitiesError) throw activitiesError;

      // Fetch profile and listing data separately
      const enrichedActivities = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, is_verified, organization_type")
            .eq("id", activity.user_id)
            .single();

          let listingData = null;
          if (activity.listing_id) {
            const { data: listing } = await supabase
              .from("food_listings")
              .select("title, category")
              .eq("id", activity.listing_id)
              .single();
            listingData = listing;
          }

          return {
            ...activity,
            profiles: profile || { name: "Unknown", is_verified: false, organization_type: "individual" },
            food_listings: listingData,
          };
        })
      );

      // Fetch top sharers (this week)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: sharersData, error: sharersError } = await supabase
        .from("profiles")
        .select("id, name, is_verified, organization_type, meals_shared")
        .gt("meals_shared", 0)
        .order("meals_shared", { ascending: false })
        .limit(10);

      if (sharersError) throw sharersError;

      setActivities(enrichedActivities || []);
      setTopSharers(
        sharersData?.map((s) => ({
          user_id: s.id,
          name: s.name,
          is_verified: s.is_verified,
          organization_type: s.organization_type,
          meals_shared: s.meals_shared,
        })) || []
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load community feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_listing":
        return <Leaf className="h-5 w-5 text-success" />;
      case "food_claimed":
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case "food_completed":
        return <Award className="h-5 w-5 text-warning" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const name = activity.profiles?.name || "Someone";
    const title = activity.food_listings?.title || "food";

    switch (activity.activity_type) {
      case "new_listing":
        return `${name} shared ${title}`;
      case "food_claimed":
        return `${name} claimed ${title}`;
      case "food_completed":
        return `${name} completed a pickup`;
      default:
        return `${name} activity`;
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Community Feed</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activities yet. Be the first to share food!
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {getActivityText(activity)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </p>
                          {activity.profiles && (
                            <VerifiedBadge
                              isVerified={activity.profiles.is_verified}
                              organizationType={activity.profiles.organization_type}
                            />
                          )}
                        </div>
                        {activity.food_listings && (
                          <Badge variant="outline" className="mt-2">
                            {activity.food_listings.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Sharers Sidebar */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-warning" />
                  Top Sharers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSharers.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No data yet
                  </p>
                ) : (
                  topSharers.map((sharer, index) => (
                    <div
                      key={sharer.user_id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-success/10 text-success">
                          {sharer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {sharer.name}
                          </p>
                          <VerifiedBadge
                            isVerified={sharer.is_verified}
                            organizationType={sharer.organization_type}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {sharer.meals_shared} meal{sharer.meals_shared !== 1 ? "s" : ""} shared
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-success/10 to-primary/10">
              <CardContent className="p-6 text-center">
                <Leaf className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-2">Share Food, Save Lives</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community in reducing food waste
                </p>
                <Button onClick={() => navigate("/create-listing")} className="w-full">
                  Share Food Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityFeed;
