-- Simple fix for RLS recursion by creating separate, non-recursive policies
-- This approach avoids any circular dependencies

-- Disable RLS temporarily to clean up
ALTER TABLE public.world_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can view worlds they own or are members of" ON public.worlds;
DROP POLICY IF EXISTS "Users can insert their own worlds" ON public.worlds;
DROP POLICY IF EXISTS "Only world owners can update worlds" ON public.worlds;
DROP POLICY IF EXISTS "Only world owners can delete worlds" ON public.worlds;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.world_members;
DROP POLICY IF EXISTS "World owners can view all memberships for their worlds" ON public.world_members;
DROP POLICY IF EXISTS "World owners can insert memberships" ON public.world_members;
DROP POLICY IF EXISTS "World owners can update memberships" ON public.world_members;
DROP POLICY IF EXISTS "World owners can delete memberships" ON public.world_members;

DROP POLICY IF EXISTS "Users can view folders in accessible worlds" ON public.folders;
DROP POLICY IF EXISTS "Users with editor+ role can manage folders" ON public.folders;

DROP POLICY IF EXISTS "Users can view card types in accessible worlds" ON public.card_types;
DROP POLICY IF EXISTS "Users with editor+ role can manage card types" ON public.card_types;

DROP POLICY IF EXISTS "Users can view cards in accessible worlds" ON public.cards;
DROP POLICY IF EXISTS "Users with editor+ role can manage cards" ON public.cards;

DROP POLICY IF EXISTS "Users can view card links in accessible worlds" ON public.card_links;
DROP POLICY IF EXISTS "Users with editor+ role can manage card links" ON public.card_links;

DROP POLICY IF EXISTS "Users can view comments in accessible worlds" ON public.comments;
DROP POLICY IF EXISTS "Users with editor+ role can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments or owners can delete any" ON public.comments;

DROP POLICY IF EXISTS "Users can view their own AI jobs" ON public.ai_jobs;
DROP POLICY IF EXISTS "Users can create AI jobs for accessible worlds" ON public.ai_jobs;
DROP POLICY IF EXISTS "Users can update their own AI jobs" ON public.ai_jobs;

-- Re-enable RLS
ALTER TABLE public.world_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- WORLD_MEMBERS: Simple policies that don't reference other tables
CREATE POLICY "world_members_select_own" ON public.world_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "world_members_select_as_owner" ON public.world_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "world_members_insert_as_owner" ON public.world_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "world_members_update_as_owner" ON public.world_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "world_members_delete_as_owner" ON public.world_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

-- WORLDS: Owner-based access with direct membership check (no sub-queries)
CREATE POLICY "worlds_select_as_owner" ON public.worlds
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "worlds_select_as_member" ON public.worlds
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = id AND user_id = auth.uid())
  );

CREATE POLICY "worlds_insert_own" ON public.worlds
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "worlds_update_as_owner" ON public.worlds
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "worlds_delete_as_owner" ON public.worlds
  FOR DELETE USING (owner_id = auth.uid());

-- FOLDERS: Simple world-based access
CREATE POLICY "folders_select_as_world_owner" ON public.folders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "folders_select_as_world_member" ON public.folders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = folders.world_id AND user_id = auth.uid())
  );

CREATE POLICY "folders_modify_as_world_owner" ON public.folders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "folders_modify_as_editor" ON public.folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.world_members 
      WHERE world_id = folders.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- CARD_TYPES: Similar pattern
CREATE POLICY "card_types_select_as_world_owner" ON public.card_types
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "card_types_select_as_world_member" ON public.card_types
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = card_types.world_id AND user_id = auth.uid())
  );

CREATE POLICY "card_types_modify_as_world_owner" ON public.card_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "card_types_modify_as_editor" ON public.card_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.world_members 
      WHERE world_id = card_types.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- CARDS: Same pattern
CREATE POLICY "cards_select_as_world_owner" ON public.cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "cards_select_as_world_member" ON public.cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = cards.world_id AND user_id = auth.uid())
  );

CREATE POLICY "cards_modify_as_world_owner" ON public.cards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "cards_modify_as_editor" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.world_members 
      WHERE world_id = cards.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- CARD_LINKS: Same pattern
CREATE POLICY "card_links_select_as_world_owner" ON public.card_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "card_links_select_as_world_member" ON public.card_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = card_links.world_id AND user_id = auth.uid())
  );

CREATE POLICY "card_links_modify_as_world_owner" ON public.card_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "card_links_modify_as_editor" ON public.card_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.world_members 
      WHERE world_id = card_links.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- COMMENTS: Same pattern
CREATE POLICY "comments_select_as_world_owner" ON public.comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

CREATE POLICY "comments_select_as_world_member" ON public.comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.world_members WHERE world_id = comments.world_id AND user_id = auth.uid())
  );

CREATE POLICY "comments_insert_as_author" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    (
      EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.world_members 
        WHERE world_id = comments.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "comments_delete_as_world_owner" ON public.comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid())
  );

-- AI_JOBS: Simple user-based access
CREATE POLICY "ai_jobs_select_own" ON public.ai_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_jobs_insert_own" ON public.ai_jobs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      world_id IS NULL OR
      EXISTS (SELECT 1 FROM public.worlds WHERE id = world_id AND owner_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.world_members 
        WHERE world_id = ai_jobs.world_id AND user_id = auth.uid() AND role IN ('owner', 'editor')
      )
    )
  );

CREATE POLICY "ai_jobs_update_own" ON public.ai_jobs
  FOR UPDATE USING (auth.uid() = user_id);
