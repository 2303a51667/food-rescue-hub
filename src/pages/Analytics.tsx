import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, ArrowLeft, TrendingUp, Package, Users, Award, CheckCircle2, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface UserStats {
  meals_shared: number;
  meals_received: number;
  co2_saved: number;
  pickups_completed: number;
  total_food_weight: number;
}

interface TimelineData {
  period: string;
  shared: number;
  received: number;
  co2: number;
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

const CATEGORY_COLORS = {
  vegetables: "#10b981",
  fruits: "#f59e0b",
  bakery: "#8b5cf6",
  dairy: "#3b82f6",
  meals: "#ec4899",
  packaged: "#6b7280",
  other: "#64748b"
};

const Analytics = () => {
  const [stats, setStats] = useState<UserStats>({
    meals_shared: 0,
    meals_received: 0,
    co2_saved: 0,
    pickups_completed: 0,
    total_food_weight: 0,
  });
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [viewMode]);

  const fetchAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Fetch user profile stats
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("meals_shared, meals_received, co2_saved")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch all listings to calculate pickups and weight
      const { data: allListings, error: listingsError } = await supabase
        .from("food_listings")
        .select("*")
        .or(`donor_id.eq.${session.user.id},claimed_by.eq.${session.user.id}`);

      if (listingsError) throw listingsError;

      // Calculate pickups completed (status = completed)
      const pickupsCompleted = allListings?.filter(l => l.status === "completed").length || 0;

      // Estimate total food weight (rough estimation: 2kg average per listing)
      const totalWeight = (profile.meals_shared || 0) * 2;

      setStats({
        meals_shared: profile.meals_shared || 0,
        meals_received: profile.meals_received || 0,
        co2_saved: profile.co2_saved || 0,
        pickups_completed: pickupsCompleted,
        total_food_weight: totalWeight,
      });

      // Fetch timeline data
      const { data: listings, error: timelineError } = await supabase
        .from("food_listings")
        .select("created_at, donor_id, claimed_by, status")
        .or(`donor_id.eq.${session.user.id},claimed_by.eq.${session.user.id}`)
        .order("created_at", { ascending: true });

      if (timelineError) throw timelineError;

      // Group by period (weekly or monthly)
      const periodData: { [key: string]: { shared: number; received: number; co2: number } } = {};
      
      listings?.forEach((listing) => {
        const date = new Date(listing.created_at);
        let period: string;
        
        if (viewMode === "weekly") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else {
          period = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        }

        if (!periodData[period]) {
          periodData[period] = { shared: 0, received: 0, co2: 0 };
        }

        if (listing.donor_id === session.user.id) {
          periodData[period].shared += 1;
          periodData[period].co2 += 2.5; // 2.5kg CO2 per meal
        }
        if (listing.claimed_by === session.user.id) {
          periodData[period].received += 1;
        }
      });

      const sortedPeriods = Object.keys(periodData).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      const timeline = sortedPeriods.slice(-8).map(period => ({
        period,
        ...periodData[period],
      }));

      setTimelineData(timeline);

      // Fetch category breakdown
      const { data: categoryListings, error: categoryError } = await supabase
        .from("food_listings")
        .select("category")
        .eq("donor_id", session.user.id);

      if (categoryError) throw categoryError;

      const categoryCounts: { [key: string]: number } = {};
      categoryListings?.forEach(listing => {
        categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
      });

      const total = categoryListings?.length || 1;
      const categories = Object.entries(categoryCounts).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count,
        percentage: Math.round((count / total) * 100),
      }));

      setCategoryData(categories);
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold">Impact Analytics</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Impact Dashboard</h1>
          <p className="text-muted-foreground">Track your contribution to reducing food waste and environmental impact</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Food Saved</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_food_weight} kg</div>
              <p className="text-xs text-muted-foreground mt-1">Total weight rescued</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Meals Shared</CardTitle>
                <Leaf className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.meals_shared}</div>
              <p className="text-xs text-muted-foreground mt-1">Food donations</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">CO₂ Reduced</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.co2_saved.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground mt-1">Carbon footprint saved</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pickups Done</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pickups_completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Successful handovers</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Meals Received</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.meals_received}</div>
              <p className="text-xs text-muted-foreground mt-1">Food rescued</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        <Card className="border-border mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Your food sharing activity over time</CardDescription>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "weekly" | "monthly")}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {timelineData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity data yet</p>
                <p className="text-sm mt-2">Start sharing food to see your impact!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="shared" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Meals Shared"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="received" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Meals Received"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>Food types you've shared</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No category data yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.category.toLowerCase() as keyof typeof CATEGORY_COLORS] || "#64748b"} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.map((cat, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category.toLowerCase() as keyof typeof CATEGORY_COLORS] || "#64748b" }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {cat.category}: {cat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* CO2 Impact Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                CO₂ Impact Over Time
              </CardTitle>
              <CardDescription>Carbon emissions prevented</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No CO₂ data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="period" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar 
                      dataKey="co2" 
                      fill="hsl(var(--success))" 
                      name="CO₂ Saved (kg)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact Info */}
        <Card className="border-border mt-8 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-success/10 p-3 rounded-full">
                <Leaf className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Your Environmental Impact</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Equivalent to:</p>
                    <p className="font-semibold text-foreground">
                      {Math.round(stats.co2_saved / 0.4)} km driven by car
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water saved:</p>
                    <p className="font-semibold text-foreground">
                      ~{Math.round(stats.total_food_weight * 1000)} liters
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Meals provided:</p>
                    <p className="font-semibold text-foreground">
                      {stats.meals_shared + stats.meals_received} total meals
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
