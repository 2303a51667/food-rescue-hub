import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowLeft, TrendingUp, Package, Users, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  meals_shared: number;
  meals_received: number;
  co2_saved: number;
  badges: string[];
}

interface ActivityData {
  month: string;
  shared: number;
  received: number;
}

const Analytics = () => {
  const [stats, setStats] = useState<UserStats>({
    meals_shared: 0,
    meals_received: 0,
    co2_saved: 0,
    badges: [],
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("meals_shared, meals_received, co2_saved")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate badges
      const badges = [];
      if (profile.meals_shared >= 1) badges.push("First Share");
      if (profile.meals_shared >= 5) badges.push("Food Hero");
      if (profile.meals_shared >= 10) badges.push("Green Champion");
      if (profile.meals_shared >= 25) badges.push("Waste Warrior");
      if (profile.meals_received >= 5) badges.push("Grateful Receiver");
      if (profile.co2_saved >= 10) badges.push("Carbon Saver");

      setStats({
        ...profile,
        badges,
      });

      // Fetch activity data (last 6 months)
      const { data: listings, error: listingsError } = await supabase
        .from("food_listings")
        .select("created_at, donor_id, claimed_by")
        .or(`donor_id.eq.${session.user.id},claimed_by.eq.${session.user.id}`)
        .order("created_at", { ascending: true });

      if (listingsError) throw listingsError;

      // Group by month
      const monthData: { [key: string]: { shared: number; received: number } } = {};
      listings?.forEach((listing) => {
        const month = new Date(listing.created_at).toLocaleDateString("en-US", { month: "short" });
        if (!monthData[month]) {
          monthData[month] = { shared: 0, received: 0 };
        }
        if (listing.donor_id === session.user.id) {
          monthData[month].shared += 1;
        }
        if (listing.claimed_by === session.user.id) {
          monthData[month].received += 1;
        }
      });

      setActivityData(
        Object.entries(monthData).map(([month, data]) => ({
          month,
          ...data,
        }))
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors: { [key: string]: string } = {
      "First Share": "bg-secondary/10 text-secondary",
      "Food Hero": "bg-primary/10 text-primary",
      "Green Champion": "bg-success/10 text-success",
      "Waste Warrior": "bg-accent/10 text-accent",
      "Grateful Receiver": "bg-warning/10 text-warning",
      "Carbon Saver": "bg-primary/10 text-primary",
    };
    return colors[badge] || "bg-muted text-muted-foreground";
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Impact</h1>
          <p className="text-muted-foreground">Track your contribution to reducing food waste</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Meals Shared</CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.meals_shared}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Total food donations
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Meals Received</CardTitle>
                <Users className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.meals_received}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Food rescued
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.co2_saved.toFixed(1)} kg</div>
              <p className="text-sm text-muted-foreground mt-1">
                Environmental impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activityData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">{data.month}</div>
                    <div className="flex-1 flex gap-2">
                      <div
                        className="bg-primary/20 rounded-full h-8 flex items-center justify-center px-4"
                        style={{ width: `${(data.shared / Math.max(...activityData.map(d => d.shared))) * 100}%`, minWidth: "60px" }}
                      >
                        <span className="text-xs font-medium">{data.shared} shared</span>
                      </div>
                      <div
                        className="bg-accent/20 rounded-full h-8 flex items-center justify-center px-4"
                        style={{ width: `${(data.received / Math.max(...activityData.map(d => d.received))) * 100}%`, minWidth: "60px" }}
                      >
                        <span className="text-xs font-medium">{data.received} received</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              <CardTitle>Your Badges</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats.badges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm mt-2">Start sharing food to earn your first badge!</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {stats.badges.map((badge, index) => (
                  <Badge key={index} className={`${getBadgeColor(badge)} text-base px-4 py-2`}>
                    <Award className="h-4 w-4 mr-2" />
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
