-- Fix the setup_world_defaults function to work properly
-- This replaces the problematic version that had invalid RETURNING syntax

-- Drop the old function
DROP FUNCTION IF EXISTS setup_world_defaults(UUID, UUID);

-- Create a simplified, working version
CREATE OR REPLACE FUNCTION setup_world_defaults(world_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Create default folders (one by one to avoid RETURNING issues)
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Characters', '#3B82F6', 'Main characters, protagonists, and important figures', 0);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Locations', '#10B981', 'Places, cities, dungeons, and geographical features', 1);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Items & Artifacts', '#8B5CF6', 'Magic items, weapons, artifacts, and important objects', 2);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Organizations', '#F59E0B', 'Guilds, factions, governments, and groups', 3);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Events & History', '#EF4444', 'Historical events, timelines, and important moments', 4);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Lore & Mythology', '#8B5CF6', 'Creation myths, legends, religions, and cultural lore', 5);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'NPCs', '#06B6D4', 'Non-player characters, side characters, and supporting cast', 6);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Quests & Plot Hooks', '#F97316', 'Adventure ideas, plot hooks, and story threads', 7);

  -- Create basic card types from templates (if the template function exists)
  -- We'll handle errors gracefully in case templates aren't available
  BEGIN
    PERFORM copy_card_type_template('Character', world_id);
  EXCEPTION WHEN OTHERS THEN
    -- If template function fails, create a basic character type manually
    INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
      (gen_random_uuid(), world_id, 'Character', 'User', '#3B82F6', '[
        {
          "key": "description",
          "label": "Description",
          "kind": "long_text",
          "required": false
        }
      ]'::jsonb);
  END;

  BEGIN
    PERFORM copy_card_type_template('Location', world_id);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
      (gen_random_uuid(), world_id, 'Location', 'MapPin', '#10B981', '[
        {
          "key": "description",
          "label": "Description",
          "kind": "long_text",
          "required": false
        }
      ]'::jsonb);
  END;

  -- Create a simple welcome card to help users get started
  INSERT INTO public.cards (id, world_id, type_id, name, slug, summary, position)
  SELECT 
    gen_random_uuid(), 
    world_id, 
    ct.id,
    'Welcome to Your World!',
    'welcome-to-your-world',
    'This is your first card. Click to edit it or create new ones!',
    0
  FROM public.card_types ct 
  WHERE ct.world_id = setup_world_defaults.world_id 
  LIMIT 1;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
