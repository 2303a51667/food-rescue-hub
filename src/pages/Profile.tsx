import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Leaf, ArrowLeft, Upload, Award, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/VerifiedBadge";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hidePhone, setHidePhone] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);
  const [privacyChatOnly, setPrivacyChatOnly] = useState(false);
  
  const [mealsShared, setMealsShared] = useState(0);
  const [mealsReceived, setMealsReceived] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);
  
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      const profileId = id || session.user.id;
      setIsOwnProfile(profileId === session.user.id);
      await fetchProfile(profileId);
      await fetchBadges(profileId);
    };
    checkAuthAndFetch();
  }, [id, navigate]);

  const fetchProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;

      setName(data.name || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
      setPhone(data.phone || "");
      setAvatarUrl(data.avatar_url || "");
      setHidePhone(data.hide_phone || false);
      setHideEmail(data.hide_email || false);
      setPrivacyChatOnly(data.privacy_chat_only || false);
      setMealsShared(data.meals_shared || 0);
      setMealsReceived(data.meals_received || 0);
      setCo2Saved(data.co2_saved || 0);
      setTotalPoints(data.total_points || 0);
      setIsVerified(data.is_verified || false);
      setAvatarPreview(data.avatar_url || null);
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

  const fetchBadges = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", profileId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    try {
      let newAvatarUrl = avatarUrl;

      if (selectedAvatar) {
        const fileExt = selectedAvatar.name.split(".").pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(fileName, selectedAvatar, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("food-images")
          .getPublicUrl(fileName);

        newAvatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          bio,
          location,
          phone,
          avatar_url: newAvatarUrl,
          hide_phone: hidePhone,
          hide_email: hideEmail,
          privacy_chat_only: privacyChatOnly,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">
                {isOwnProfile ? "My Profile" : "User Profile"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || avatarUrl} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{name}</h3>
                    <VerifiedBadge isVerified={isVerified} />
                  </div>
                  <p className="text-sm text-muted-foreground">{location}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meals Shared</span>
                  <Badge variant="secondary">{mealsShared}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meals Received</span>
                  <Badge variant="secondary">{mealsReceived}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CO₂ Saved</span>
                  <Badge variant="secondary">{co2Saved.toFixed(1)} kg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    Points
                  </span>
                  <Badge variant="default">{totalPoints}</Badge>
                </div>
              </div>

              {badges.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Achievements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Badge 
                        key={badge.id} 
                        variant={
                          badge.badge_type === 'gold' ? 'default' : 
                          badge.badge_type === 'silver' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {badge.badge_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{isOwnProfile ? "Edit Profile" : "About"}</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Update your profile information and privacy settings" : "User information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOwnProfile ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview || avatarUrl} alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Label
                          htmlFor="avatar-upload"
                          className="cursor-pointer text-primary hover:underline flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Change Avatar
                        </Label>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Max 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Privacy Settings</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hide Phone Number</Label>
                        <p className="text-xs text-muted-foreground">
                          Others won't see your phone number
                        </p>
                      </div>
                      <Switch
                        checked={hidePhone}
                        onCheckedChange={setHidePhone}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hide Email</Label>
                        <p className="text-xs text-muted-foreground">
                          Others won't see your email address
                        </p>
                      </div>
                      <Switch
                        checked={hideEmail}
                        onCheckedChange={setHideEmail}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Chat Only Mode</Label>
                        <p className="text-xs text-muted-foreground">
                          Force communication through platform chat
                        </p>
                      </div>
                      <Switch
                        checked={privacyChatOnly}
                        onCheckedChange={setPrivacyChatOnly}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="mt-1">{bio || "No bio provided"}</p>
                  </div>
                  
                  {!hidePhone && phone && (
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="mt-1">{phone}</p>
                    </div>
                  )}
                  
                  {location && (
                    <div>
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="mt-1">{location}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
