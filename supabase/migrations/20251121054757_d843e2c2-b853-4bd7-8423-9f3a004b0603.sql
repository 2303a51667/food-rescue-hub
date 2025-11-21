-- Add online presence tracking
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presence"
ON public.user_presence FOR SELECT
USING (true);

CREATE POLICY "Users can update own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence status"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- Add typing indicator tracking
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_with UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view typing in their chats"
ON public.typing_indicators FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = chat_with);

CREATE POLICY "Users can insert their typing status"
ON public.typing_indicators FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their typing status"
ON public.typing_indicators FOR UPDATE
USING (auth.uid() = user_id);

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS typing_indicators_user_chat_idx 
ON public.typing_indicators(user_id, chat_with);

-- Enable realtime for new tables
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_presence'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'typing_indicators'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
  END IF;
END $$;