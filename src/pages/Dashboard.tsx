import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, Plus, MapPin, Clock, Package, TrendingUp, Trophy, UserCircle, History as HistoryIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher, useLanguage } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationsCenter from "@/components/NotificationsCenter";

interface UserProfile {
  meals_shared: number;
  meals_received: number;
  co2_saved: number;
}

interface FoodListing {
  id: string;
  title: string;
  status: string;
  created_at: string;
  category: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentListings, setRecentListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setLoading(false);
          navigate("/auth");
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("meals_shared, meals_received, co2_saved")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch recent listings
      const { data: listingsData, error: listingsError } = await supabase
        .from("food_listings")
        .select("id, title, status, created_at, category")
        .eq("donor_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (listingsError) throw listingsError;
      setRecentListings(listingsData || []);

      // Set up real-time subscription for user's listings
      const listingsChannel = supabase
        .channel('user-listings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'food_listings',
            filter: `donor_id=eq.${userId}`
          },
          (payload) => {
            console.log('User listing changed:', payload);
            
            if (payload.eventType === 'INSERT') {
              setRecentListings(prev => [payload.new as FoodListing, ...prev].slice(0, 5));
            } else if (payload.eventType === 'UPDATE') {
              setRecentListings(prev => 
                prev.map(l => l.id === payload.new.id ? payload.new as FoodListing : l)
              );
            } else if (payload.eventType === 'DELETE') {
              setRecentListings(prev => prev.filter(l => l.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // Set up real-time subscription for profile changes
      const profileChannel = supabase
        .channel('user-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            const newProfile = payload.new as any;
            setProfile({
              meals_shared: newProfile.meals_shared,
              meals_received: newProfile.meals_received,
              co2_saved: newProfile.co2_saved
            });
          }
        )
        .subscribe();

      // Clean up subscriptions
      return () => {
        supabase.removeChannel(listingsChannel);
        supabase.removeChannel(profileChannel);
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FoodShare</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher language={language} setLanguage={setLanguage} />
            <NotificationsCenter />
            <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")}>
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              <HistoryIcon className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/analytics")}>
              {t("analytics")}
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.user_metadata?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("signOut")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("welcomeBack")}, {user?.user_metadata?.name?.split(' ')[0] || 'Friend'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("readyToMake")}
          </p>
          <p className="text-2xl font-semibold text-success mt-4">
            Share Food, Save Lives.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/create-listing")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Share Food</CardTitle>
                  <CardDescription>
                    List your surplus food for others to claim
                  </CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Create Listing
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/browse")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Find Food</CardTitle>
                  <CardDescription>
                    Browse available food near you
                  </CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Browse Listings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/analytics")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Impact</CardTitle>
                  <CardDescription>
                    View detailed analytics and stats
                  </CardDescription>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meals Shared
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.meals_shared || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.meals_shared ? "Keep up the great work!" : "Start sharing to see your impact"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meals Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.meals_received || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.meals_received ? "Thank you for reducing waste!" : "Browse available food nearby"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CO₂ Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.co2_saved?.toFixed(1) || 0} kg
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Environmental impact tracker
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your food sharing history</CardDescription>
          </CardHeader>
          <CardContent>
            {recentListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm mt-2">Start by creating or browsing listings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(listing.created_at)} • {listing.category}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
