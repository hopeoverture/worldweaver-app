-- Fix the specific RLS recursion issue affecting cards query
-- The problem is in the world_members policy that's accessed during card queries

-- Replace the problematic world_members policy with a simpler one
DROP POLICY IF EXISTS "Users can view memberships for worlds they have access to" ON public.world_members;

-- Create a simple policy that only allows users to see their own memberships
-- This breaks the circular reference
CREATE POLICY "Users can view only their own memberships" ON public.world_members
  FOR SELECT USING (user_id = auth.uid());
