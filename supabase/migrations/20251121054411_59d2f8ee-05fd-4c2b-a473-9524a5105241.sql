-- Enable realtime for all relevant tables
ALTER TABLE public.food_listings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.community_activities REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.user_badges REPLICA IDENTITY FULL;

-- Add tables to realtime publication (messages already added)
DO $$
BEGIN
  -- Add food_listings if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'food_listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.food_listings;
  END IF;

  -- Add notifications if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  -- Add community_activities if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'community_activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_activities;
  END IF;

  -- Add profiles if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  -- Add user_badges if not already in publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_badges'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
  END IF;
END $$;