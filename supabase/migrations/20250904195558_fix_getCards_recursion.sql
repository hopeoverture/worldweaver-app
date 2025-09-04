-- Fix the specific recursion issue in world_members policy that's affecting getCards
-- This replaces the problematic policy from the original migration

-- Drop the problematic policy that's causing recursion
DROP POLICY IF EXISTS "Users can view memberships for worlds they have access to" ON public.world_members;

-- Replace it with a simpler policy that doesn't create recursion
CREATE POLICY "Users can view their own memberships" ON public.world_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "World owners can view all memberships" ON public.world_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );
