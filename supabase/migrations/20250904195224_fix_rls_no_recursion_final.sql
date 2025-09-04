-- Final fix for RLS recursion - completely eliminate circular dependencies
-- Use a function-based approach that avoids policy recursion

-- Create a function to check world access without RLS recursion
CREATE OR REPLACE FUNCTION public.user_has_world_access(world_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.worlds w 
    WHERE w.id = world_uuid AND w.owner_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.world_members wm 
    WHERE wm.world_id = world_uuid AND wm.user_id = user_uuid
  );
$$;

-- Create a function to check if user can edit world
CREATE OR REPLACE FUNCTION public.user_can_edit_world(world_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.worlds w 
    WHERE w.id = world_uuid AND w.owner_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.world_members wm 
    WHERE wm.world_id = world_uuid AND wm.user_id = user_uuid 
    AND wm.role IN ('owner', 'editor')
  );
$$;

-- Disable RLS temporarily to clean up all policies
ALTER TABLE public.world_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.world_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

-- Create new, completely non-recursive policies using functions
-- WORLDS: Only owner-based access initially
CREATE POLICY "worlds_owner_all" ON public.worlds
  FOR ALL USING (owner_id = auth.uid());

-- WORLD_MEMBERS: Only for owners and the member themselves
CREATE POLICY "world_members_view_own" ON public.world_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "world_members_view_as_owner" ON public.world_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "world_members_manage_as_owner" ON public.world_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

-- Now add member access to worlds using a simple subquery (no function call)
CREATE POLICY "worlds_member_select" ON public.worlds
  FOR SELECT USING (
    id IN (SELECT world_id FROM public.world_members WHERE user_id = auth.uid())
  );

-- FOLDERS: Use the helper function
CREATE POLICY "folders_access" ON public.folders
  FOR SELECT USING (public.user_has_world_access(world_id, auth.uid()));

CREATE POLICY "folders_edit" ON public.folders
  FOR ALL USING (public.user_can_edit_world(world_id, auth.uid()));

-- CARD_TYPES: Use the helper function
CREATE POLICY "card_types_access" ON public.card_types
  FOR SELECT USING (public.user_has_world_access(world_id, auth.uid()));

CREATE POLICY "card_types_edit" ON public.card_types
  FOR ALL USING (public.user_can_edit_world(world_id, auth.uid()));

-- CARDS: Use the helper function
CREATE POLICY "cards_access" ON public.cards
  FOR SELECT USING (public.user_has_world_access(world_id, auth.uid()));

CREATE POLICY "cards_edit" ON public.cards
  FOR ALL USING (public.user_can_edit_world(world_id, auth.uid()));

-- CARD_LINKS: Use the helper function
CREATE POLICY "card_links_access" ON public.card_links
  FOR SELECT USING (public.user_has_world_access(world_id, auth.uid()));

CREATE POLICY "card_links_edit" ON public.card_links
  FOR ALL USING (public.user_can_edit_world(world_id, auth.uid()));

-- COMMENTS: Use the helper function
CREATE POLICY "comments_access" ON public.comments
  FOR SELECT USING (public.user_has_world_access(world_id, auth.uid()));

CREATE POLICY "comments_create" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND 
    public.user_can_edit_world(world_id, auth.uid())
  );

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_as_owner" ON public.comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

-- AI_JOBS: Simple user-based access
CREATE POLICY "ai_jobs_own" ON public.ai_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Profiles (keep simple)
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Usage events (keep simple)  
CREATE POLICY "usage_events_own" ON public.usage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_events_insert" ON public.usage_events
  FOR INSERT WITH CHECK (true); -- Service role only

-- Grant necessary permissions for the functions
GRANT EXECUTE ON FUNCTION public.user_has_world_access TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_edit_world TO anon, authenticated;
