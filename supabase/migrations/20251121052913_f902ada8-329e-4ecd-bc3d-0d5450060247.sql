-- Add new fields to food_listings table
ALTER TABLE public.food_listings
ADD COLUMN IF NOT EXISTS contactless_pickup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shelf_life_status TEXT DEFAULT 'fresh' CHECK (shelf_life_status IN ('fresh', 'expiring_soon', 'expiring_today')),
ADD COLUMN IF NOT EXISTS safety_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_rating NUMERIC(3,2) CHECK (quality_rating >= 1.0 AND quality_rating <= 5.0);

-- Create ratings table for food quality
CREATE TABLE IF NOT EXISTS public.food_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.food_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- Enable RLS on ratings
ALTER TABLE public.food_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Users can view all ratings"
  ON public.food_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for claimed food"
  ON public.food_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.food_listings
      WHERE id = listing_id AND claimed_by = auth.uid()
    )
  );

-- Function to update average quality rating
CREATE OR REPLACE FUNCTION public.update_listing_quality_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.food_listings
  SET quality_rating = (
    SELECT AVG(rating)::numeric(3,2)
    FROM public.food_ratings
    WHERE listing_id = NEW.listing_id
  )
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update quality rating on new rating
CREATE TRIGGER update_quality_rating_on_insert
  AFTER INSERT ON public.food_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_listing_quality_rating();

-- Function to auto-remove expired listings
CREATE OR REPLACE FUNCTION public.mark_expired_listings()
RETURNS void AS $$
BEGIN
  UPDATE public.food_listings
  SET status = 'expired'
  WHERE status = 'available'
    AND available_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update shelf life status
CREATE OR REPLACE FUNCTION public.update_shelf_life_status()
RETURNS TRIGGER AS $$
DECLARE
  hours_until_expiry NUMERIC;
BEGIN
  hours_until_expiry := EXTRACT(EPOCH FROM (NEW.available_until - NOW())) / 3600;
  
  IF hours_until_expiry <= 24 THEN
    NEW.shelf_life_status := 'expiring_today';
  ELSIF hours_until_expiry <= 48 THEN
    NEW.shelf_life_status := 'expiring_soon';
  ELSE
    NEW.shelf_life_status := 'fresh';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update shelf life status
CREATE TRIGGER update_shelf_life_before_insert_update
  BEFORE INSERT OR UPDATE ON public.food_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shelf_life_status();

-- Create community feed activities table
CREATE TABLE IF NOT EXISTS public.community_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('new_listing', 'food_claimed', 'food_completed')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on community activities
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

-- RLS policy for community activities
CREATE POLICY "Community activities are viewable by everyone"
  ON public.community_activities FOR SELECT
  USING (true);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_food_nearby', 'food_requested', 'pickup_reminder', 'food_claimed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);