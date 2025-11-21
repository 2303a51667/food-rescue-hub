import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Leaf, ArrowLeft, CalendarIcon, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const listingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  category: z.enum(["vegetables", "fruits", "bakery", "dairy", "meals", "packaged", "other"]),
  quantity: z.string().trim().min(1, "Quantity is required").max(50, "Quantity description too long"),
  pickup_location: z.string().trim().min(5, "Location must be at least 5 characters").max(200, "Location too long"),
  available_until: z.date({ required_error: "Expiry date is required" }),
  available_from: z.date({ required_error: "Pickup time is required" }),
});

const EditListing = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [contactlessPickup, setContactlessPickup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      await fetchListing(session.user.id);
    };
    checkAuthAndFetch();
  }, [id, navigate]);

  const fetchListing = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data.donor_id !== currentUserId) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own listings",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setQuantity(data.quantity);
      setPickupLocation(data.pickup_location);
      setPickupDate(new Date(data.available_from));
      setExpiryDate(new Date(data.available_until));
      setContactlessPickup(data.contactless_pickup || false);
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load listing",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      title,
      description,
      category,
      quantity,
      pickup_location: pickupLocation,
      available_until: expiryDate,
      available_from: pickupDate,
    };

    try {
      const validated = listingSchema.parse(data);

      let imageUrl = imagePreview;

      if (selectedImage && userId) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("food-images")
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("food-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("food_listings")
        .update({
          title: validated.title,
          description: validated.description,
          category: validated.category,
          quantity: validated.quantity,
          pickup_location: validated.pickup_location,
          available_until: validated.available_until.toISOString(),
          available_from: validated.available_from.toISOString(),
          contactless_pickup: contactlessPickup,
          image_url: imageUrl,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your listing has been updated.",
      });

      navigate(`/listing/${id}`);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update listing",
          variant: "destructive",
        });
      }
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
            <Button variant="ghost" size="sm" onClick={() => navigate(`/listing/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Edit Listing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Edit Your Food Listing</CardTitle>
            <CardDescription>
              Update the details of your food listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Fresh vegetables from garden"
                  required
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the food items, their condition, and any other relevant details"
                  required
                  maxLength={500}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Food Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer text-primary hover:underline"
                      >
                        Click to upload food image
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Max 5MB (JPG, PNG, WEBP)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="meals">Prepared Meals</SelectItem>
                      <SelectItem value="packaged">Packaged Foods</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 2kg, 5 servings, 1 basket"
                    required
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location *</Label>
                <Input
                  id="pickup_location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g., 123 Main St, Apartment 4B, City"
                  required
                  maxLength={200}
                  disabled={isLoading}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Available From *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !pickupDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pickupDate ? format(pickupDate, "PPP p") : "Select pickup time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          onChange={(e) => {
                            if (pickupDate && e.target.value) {
                              const [hours, minutes] = e.target.value.split(":");
                              const newDate = new Date(pickupDate);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              setPickupDate(newDate);
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Available Until (Expiry) *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP p") : "Select expiry time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          onChange={(e) => {
                            if (expiryDate && e.target.value) {
                              const [hours, minutes] = e.target.value.split(":");
                              const newDate = new Date(expiryDate);
                              newDate.setHours(parseInt(hours), parseInt(minutes));
                              setExpiryDate(newDate);
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="contactless"
                  checked={contactlessPickup}
                  onCheckedChange={setContactlessPickup}
                />
                <Label htmlFor="contactless" className="cursor-pointer">
                  Contactless Pickup (Leave at door)
                </Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Listing"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/listing/${id}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditListing;
