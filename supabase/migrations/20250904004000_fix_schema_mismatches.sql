-- Fix schema mismatches between database and TypeScript types

-- Add missing columns to folders table
ALTER TABLE public.folders 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing folders to have default position based on creation order
WITH numbered_folders AS (
  SELECT id, row_number() OVER (PARTITION BY world_id ORDER BY created_at) - 1 as new_position
  FROM public.folders
  WHERE position IS NULL OR position = 0
)
UPDATE public.folders 
SET position = numbered_folders.new_position
FROM numbered_folders
WHERE folders.id = numbered_folders.id;

-- Add missing columns to cards table
ALTER TABLE public.cards 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Migrate existing data: copy title to name if name is null
UPDATE public.cards 
SET name = title 
WHERE name IS NULL;

-- Update existing cards to have default position based on creation order
WITH numbered_cards AS (
  SELECT id, row_number() OVER (PARTITION BY world_id ORDER BY created_at) - 1 as new_position
  FROM public.cards
  WHERE position IS NULL OR position = 0
)
UPDATE public.cards 
SET position = numbered_cards.new_position
FROM numbered_cards
WHERE cards.id = numbered_cards.id;

-- Make name column NOT NULL after migration
ALTER TABLE public.cards 
ALTER COLUMN name SET NOT NULL;

-- Update the card links table to match expected schema
-- Rename columns to match TypeScript types
ALTER TABLE public.card_links 
RENAME COLUMN from_card TO from_card_id;

ALTER TABLE public.card_links 
RENAME COLUMN to_card TO to_card_id;

ALTER TABLE public.card_links 
RENAME COLUMN label TO relationship_type;

ALTER TABLE public.card_links 
RENAME COLUMN note TO description;

-- Add missing columns to card_links
ALTER TABLE public.card_links 
DROP COLUMN IF EXISTS updated_at;

-- Create card_data table for structured field storage
CREATE TABLE IF NOT EXISTS public.card_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  field_key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, field_key)
);

-- Enable RLS on card_data
ALTER TABLE public.card_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for card_data
CREATE POLICY "Users can view card data from their worlds" ON public.card_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public.worlds ON cards.world_id = worlds.id
      WHERE cards.id = card_data.card_id
      AND (
        worlds.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.world_members
          WHERE world_members.world_id = worlds.id
          AND world_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage card data in their worlds" ON public.card_data
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cards
      JOIN public.worlds ON cards.world_id = worlds.id
      WHERE cards.id = card_data.card_id
      AND (
        worlds.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.world_members
          WHERE world_members.world_id = worlds.id
          AND world_members.user_id = auth.uid()
          AND world_members.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_data_card_id ON public.card_data(card_id);
CREATE INDEX IF NOT EXISTS idx_card_data_field_key ON public.card_data(field_key);
CREATE INDEX IF NOT EXISTS idx_folders_position ON public.folders(world_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_position ON public.cards(world_id, position);

-- Add updated_at trigger for card_data
CREATE TRIGGER update_card_data_updated_at 
  BEFORE UPDATE ON public.card_data 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Migrate existing card fields data to card_data table
-- This will copy the JSONB fields into individual rows
INSERT INTO public.card_data (card_id, field_key, value, created_at, updated_at)
SELECT 
  cards.id as card_id,
  key as field_key,
  jsonb_build_object('value', value) as value,
  cards.created_at,
  cards.updated_at
FROM public.cards
CROSS JOIN LATERAL jsonb_each(cards.fields)
WHERE cards.fields IS NOT NULL 
  AND cards.fields != '{}'::jsonb
ON CONFLICT (card_id, field_key) DO NOTHING;
