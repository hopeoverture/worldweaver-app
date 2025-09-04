-- Row Level Security (RLS) policies for WorldWeaver
-- Ensures users can only access data they have permission to see

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Worlds policies
CREATE POLICY "Users can view worlds they own or are members of" ON public.worlds
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM public.world_members 
      WHERE world_id = worlds.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own worlds" ON public.worlds
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only world owners can update worlds" ON public.worlds
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Only world owners can delete worlds" ON public.worlds
  FOR DELETE USING (auth.uid() = owner_id);

-- World members policies
CREATE POLICY "Users can view memberships for worlds they have access to" ON public.world_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm2 
          WHERE wm2.world_id = w.id AND wm2.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Only world owners can manage memberships" ON public.world_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

-- Folders policies
CREATE POLICY "Users can view folders in accessible worlds" ON public.folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users with editor+ role can manage folders" ON public.folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Card types policies
CREATE POLICY "Users can view card types in accessible worlds" ON public.card_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users with editor+ role can manage card types" ON public.card_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Cards policies
CREATE POLICY "Users can view cards in accessible worlds" ON public.cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users with editor+ role can manage cards" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Card links policies
CREATE POLICY "Users can view card links in accessible worlds" ON public.card_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users with editor+ role can manage card links" ON public.card_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments in accessible worlds" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users with editor+ role can create comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments or owners can delete any" ON public.comments
  FOR DELETE USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

-- AI jobs policies
CREATE POLICY "Users can view their own AI jobs" ON public.ai_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI jobs for accessible worlds" ON public.ai_jobs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (world_id IS NULL OR EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND (
        w.owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM public.world_members wm 
          WHERE wm.world_id = w.id AND wm.user_id = auth.uid() AND wm.role IN ('owner', 'editor')
        )
      )
    ))
  );

CREATE POLICY "Users can update their own AI jobs" ON public.ai_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Usage events policies
CREATE POLICY "Users can view their own usage events" ON public.usage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage events" ON public.usage_events
  FOR INSERT WITH CHECK (true); -- Will be handled by service role
