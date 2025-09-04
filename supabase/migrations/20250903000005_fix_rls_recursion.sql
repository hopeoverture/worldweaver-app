-- Fix RLS policy recursion issue for world_members table
-- This migration fixes the infinite recursion in world_members policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view world memberships" ON public.world_members;
DROP POLICY IF EXISTS "Only world owners can manage memberships" ON public.world_members;

-- Create corrected policies for world_members
CREATE POLICY "Users can view their own memberships" ON public.world_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "World owners can view all memberships" ON public.world_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Only world owners can manage memberships" ON public.world_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Only world owners can update memberships" ON public.world_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Only world owners can delete memberships" ON public.world_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.worlds w 
      WHERE w.id = world_id AND w.owner_id = auth.uid()
    )
  );
