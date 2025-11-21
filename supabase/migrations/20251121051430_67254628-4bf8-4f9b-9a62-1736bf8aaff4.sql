-- Function to increment meals_shared when a new listing is created
CREATE OR REPLACE FUNCTION increment_meals_shared()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    meals_shared = meals_shared + 1,
    co2_saved = co2_saved + 2.5
  WHERE id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new listings
CREATE TRIGGER on_listing_created
AFTER INSERT ON public.food_listings
FOR EACH ROW
EXECUTE FUNCTION increment_meals_shared();

-- Function to increment meals_received when a listing is claimed
CREATE OR REPLACE FUNCTION increment_meals_received()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'claimed' AND OLD.status = 'available' AND NEW.claimed_by IS NOT NULL THEN
    UPDATE public.profiles
    SET meals_received = meals_received + 1
    WHERE id = NEW.claimed_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for claimed listings
CREATE TRIGGER on_listing_claimed
AFTER UPDATE ON public.food_listings
FOR EACH ROW
WHEN (NEW.status = 'claimed' AND OLD.status = 'available')
EXECUTE FUNCTION increment_meals_received();