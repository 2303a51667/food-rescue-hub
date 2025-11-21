import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, ArrowLeft, Trophy, Medal, Award, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/VerifiedBadge";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string | null;
  meals_shared: number;
  total_points: number;
  is_verified: boolean;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "alltime">("weekly");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, meals_shared, total_points, is_verified")
        .order("total_points", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTopUsers(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Leaderboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top Food Heroes
            </CardTitle>
            <CardDescription>
              Champions making the biggest impact in reducing food waste
            </CardDescription>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant={timeRange === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={timeRange === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={timeRange === "alltime" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("alltime")}
              >
                All Time
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Leaf className="h-12 w-12 text-primary animate-pulse" />
              </div>
            ) : (
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent cursor-pointer ${
                      index < 3 ? "bg-accent/50" : ""
                    }`}
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index) || (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <VerifiedBadge isVerified={user.is_verified} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.meals_shared} meals shared
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {user.total_points} pts
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

export default Leaderboard;
