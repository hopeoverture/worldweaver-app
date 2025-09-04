-- Add saved searches table for storing user search queries

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT saved_searches_name_world_unique UNIQUE(user_id, world_id, name)
);

-- Create indexes
CREATE INDEX idx_saved_searches_user_world ON public.saved_searches(user_id, world_id);
CREATE INDEX idx_saved_searches_filters ON public.saved_searches USING gin(filters);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "saved_searches_access" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_insert" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_searches_update" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_searches_delete" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_searches_updated_at 
  BEFORE UPDATE ON public.saved_searches 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
