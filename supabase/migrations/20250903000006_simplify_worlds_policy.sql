-- Temporary fix: Simplify worlds policies to remove recursion
-- This will be enhanced later when we implement proper world sharing

-- Drop the current world policy that's causing recursion
DROP POLICY IF EXISTS "Users can view worlds they own or are members of" ON public.worlds;

-- Create a simpler policy for now (owners only)
CREATE POLICY "Users can view their own worlds" ON public.worlds
  FOR SELECT USING (auth.uid() = owner_id);
