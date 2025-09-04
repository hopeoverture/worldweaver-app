-- Fix card_types RLS policies to avoid infinite recursion
-- The issue is that card_types policies check world_members, but world_members policies also check world access

-- Drop the problematic card_types policies that cause recursion
DROP POLICY IF EXISTS "Users can view card types in accessible worlds" ON public.card_types;
DROP POLICY IF EXISTS "Users with editor+ role can manage card types" ON public.card_types;

-- Create simplified card_types policies that don't cause recursion
-- These policies only check direct world ownership, avoiding the circular dependency

CREATE POLICY "World owners can view their card types" ON public.card_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "World owners can manage their card types" ON public.card_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

-- Note: For now, we're only allowing world owners to manage card types
-- This avoids the recursion issue. In the future, we can add more complex
-- membership-based permissions once we have a better RLS architecture.
