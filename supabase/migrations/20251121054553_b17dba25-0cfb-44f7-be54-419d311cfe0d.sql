-- Function to create community activity on new listing
CREATE OR REPLACE FUNCTION public.create_listing_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_activities (user_id, listing_id, activity_type)
  VALUES (NEW.donor_id, NEW.id, 'new_listing');
  RETURN NEW;
END;
$$;

-- Function to create community activity on food claim
CREATE OR REPLACE FUNCTION public.create_claim_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'claimed' AND OLD.status = 'available' AND NEW.claimed_by IS NOT NULL THEN
    INSERT INTO public.community_activities (user_id, listing_id, activity_type)
    VALUES (NEW.claimed_by, NEW.id, 'food_claimed');
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create community activity on completion
CREATE OR REPLACE FUNCTION public.create_completion_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.community_activities (user_id, listing_id, activity_type)
    VALUES (NEW.donor_id, NEW.id, 'food_completed');
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS create_listing_activity_trigger ON public.food_listings;
CREATE TRIGGER create_listing_activity_trigger
AFTER INSERT ON public.food_listings
FOR EACH ROW
EXECUTE FUNCTION public.create_listing_activity();

DROP TRIGGER IF EXISTS create_claim_activity_trigger ON public.food_listings;
CREATE TRIGGER create_claim_activity_trigger
AFTER UPDATE ON public.food_listings
FOR EACH ROW
EXECUTE FUNCTION public.create_claim_activity();

DROP TRIGGER IF EXISTS create_completion_activity_trigger ON public.food_listings;
CREATE TRIGGER create_completion_activity_trigger
AFTER UPDATE ON public.food_listings
FOR EACH ROW
EXECUTE FUNCTION public.create_completion_activity();