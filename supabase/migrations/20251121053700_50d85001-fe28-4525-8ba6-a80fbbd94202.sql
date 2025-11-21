-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add privacy settings and points to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hide_phone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS privacy_chat_only BOOLEAN DEFAULT false;

-- Create badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_name TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
ON public.user_badges FOR SELECT
USING (true);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add request tracking to food_listings
ALTER TABLE public.food_listings
ADD COLUMN IF NOT EXISTS requested_by UUID[],
ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS pickup_confirmed_by_donor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_confirmed_by_receiver BOOLEAN DEFAULT false;

-- Function to award points and badges
CREATE OR REPLACE FUNCTION public.award_points_and_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  donor_meals INTEGER;
BEGIN
  -- Award 10 points for donation
  UPDATE public.profiles
  SET total_points = total_points + 10
  WHERE id = NEW.donor_id;
  
  -- Award 5 points to receiver
  IF NEW.claimed_by IS NOT NULL THEN
    UPDATE public.profiles
    SET total_points = total_points + 5
    WHERE id = NEW.claimed_by;
  END IF;
  
  -- Check for badge eligibility
  SELECT meals_shared INTO donor_meals
  FROM public.profiles
  WHERE id = NEW.donor_id;
  
  -- Bronze badge (5 meals)
  IF donor_meals >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.user_badges 
    WHERE user_id = NEW.donor_id AND badge_name = 'Bronze Food Saver'
  ) THEN
    INSERT INTO public.user_badges (user_id, badge_name, badge_type)
    VALUES (NEW.donor_id, 'Bronze Food Saver', 'bronze');
  END IF;
  
  -- Silver badge (15 meals)
  IF donor_meals >= 15 AND NOT EXISTS (
    SELECT 1 FROM public.user_badges 
    WHERE user_id = NEW.donor_id AND badge_name = 'Silver Food Hero'
  ) THEN
    INSERT INTO public.user_badges (user_id, badge_name, badge_type)
    VALUES (NEW.donor_id, 'Silver Food Hero', 'silver');
  END IF;
  
  -- Gold badge (50 meals)
  IF donor_meals >= 50 AND NOT EXISTS (
    SELECT 1 FROM public.user_badges 
    WHERE user_id = NEW.donor_id AND badge_name = 'Gold Green Champion'
  ) THEN
    INSERT INTO public.user_badges (user_id, badge_name, badge_type)
    VALUES (NEW.donor_id, 'Gold Green Champion', 'gold');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for awarding points
CREATE TRIGGER award_points_on_claim
AFTER UPDATE OF status ON public.food_listings
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION public.award_points_and_badges();

-- Function to auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_assign_role
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_role();