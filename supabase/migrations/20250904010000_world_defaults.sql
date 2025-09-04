-- Create default folders and starter content for new worlds
-- This migration adds a function to set up default content when a world is created

-- Function to set up default folders and starter content for a new world
CREATE OR REPLACE FUNCTION setup_world_defaults(world_id UUID, user_id UUID)
RETURNS VOID AS $$
DECLARE
  folder_characters UUID;
  folder_locations UUID;
  folder_items UUID;
  folder_organizations UUID;
  folder_events UUID;
  folder_lore UUID;
  folder_npcs UUID;
  folder_quests UUID;
  
  type_character UUID;
  type_location UUID;
  type_item UUID;
  type_organization UUID;
  type_event UUID;
  type_npc UUID;
  type_quest UUID;
BEGIN
  -- Create default folders
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), world_id, 'Characters', '#3B82F6', 'Main characters, protagonists, and important figures', 0),
    (gen_random_uuid(), world_id, 'Locations', '#10B981', 'Places, cities, dungeons, and geographical features', 1),
    (gen_random_uuid(), world_id, 'Items & Artifacts', '#8B5CF6', 'Magic items, weapons, artifacts, and important objects', 2),
    (gen_random_uuid(), world_id, 'Organizations', '#F59E0B', 'Guilds, factions, governments, and groups', 3),
    (gen_random_uuid(), world_id, 'Events & History', '#EF4444', 'Historical events, timelines, and important moments', 4),
    (gen_random_uuid(), world_id, 'Lore & Mythology', '#8B5CF6', 'Creation myths, legends, religions, and cultural lore', 5),
    (gen_random_uuid(), world_id, 'NPCs', '#06B6D4', 'Non-player characters, side characters, and supporting cast', 6),
    (gen_random_uuid(), world_id, 'Quests & Plot Hooks', '#F97316', 'Adventure ideas, plot hooks, and story threads', 7)
  RETURNING 
    CASE WHEN name = 'Characters' THEN id END,
    CASE WHEN name = 'Locations' THEN id END,
    CASE WHEN name = 'Items & Artifacts' THEN id END,
    CASE WHEN name = 'Organizations' THEN id END,
    CASE WHEN name = 'Events & History' THEN id END,
    CASE WHEN name = 'Lore & Mythology' THEN id END,
    CASE WHEN name = 'NPCs' THEN id END,
    CASE WHEN name = 'Quests & Plot Hooks' THEN id END
  INTO folder_characters, folder_locations, folder_items, folder_organizations, folder_events, folder_lore, folder_npcs, folder_quests;

  -- Get the folder IDs (since the RETURNING doesn't work as expected with multiple rows)
  SELECT id INTO folder_characters FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Characters';
  SELECT id INTO folder_locations FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Locations';
  SELECT id INTO folder_items FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Items & Artifacts';
  SELECT id INTO folder_organizations FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Organizations';
  SELECT id INTO folder_events FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Events & History';
  SELECT id INTO folder_lore FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Lore & Mythology';
  SELECT id INTO folder_npcs FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'NPCs';
  SELECT id INTO folder_quests FROM public.folders WHERE world_id = setup_world_defaults.world_id AND name = 'Quests & Plot Hooks';

  -- Create default card types using the existing template function
  SELECT copy_card_type_template('Character', world_id) INTO type_character;
  SELECT copy_card_type_template('Location', world_id) INTO type_location;
  SELECT copy_card_type_template('Magic Item', world_id, 'Item/Artifact') INTO type_item;
  SELECT copy_card_type_template('Organization', world_id) INTO type_organization;

  -- Create additional card types
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), world_id, 'Event', 'Calendar', '#EF4444', '[
      {
        "key": "date",
        "label": "Date/Time Period",
        "kind": "text",
        "required": false
      },
      {
        "key": "type",
        "label": "Event Type",
        "kind": "select",
        "required": false,
        "options": ["Battle", "Discovery", "Founding", "Disaster", "Political", "Religious", "Cultural", "Other"]
      },
      {
        "key": "importance",
        "label": "Historical Importance",
        "kind": "select",
        "required": false,
        "options": ["World-changing", "Major", "Significant", "Minor", "Local"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this historical event in detail, including what happened and why it was significant."
      },
      {
        "key": "participants",
        "label": "Key Participants",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "consequences",
        "label": "Consequences & Impact",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe the lasting consequences and impact of this event on the world."
      },
      {
        "key": "location",
        "label": "Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      }
    ]'::jsonb),
    (gen_random_uuid(), world_id, 'NPC', 'User', '#06B6D4', '[
      {
        "key": "role",
        "label": "Role/Occupation",
        "kind": "text",
        "required": false
      },
      {
        "key": "disposition",
        "label": "Disposition to Party",
        "kind": "select",
        "required": false,
        "options": ["Hostile", "Unfriendly", "Neutral", "Friendly", "Helpful"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "Describe this NPC including their appearance, personality, and role in the world."
      },
      {
        "key": "motivation",
        "label": "Motivation",
        "kind": "text",
        "required": false,
        "ai_prompt": "What drives this NPC? What do they want?"
      },
      {
        "key": "secret",
        "label": "Secret/Hidden Info",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "location",
        "label": "Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "organization",
        "label": "Organization",
        "kind": "reference",
        "ref_type": "Organization",
        "required": false
      }
    ]'::jsonb),
    (gen_random_uuid(), world_id, 'Quest', 'Target', '#F97316', '[
      {
        "key": "type",
        "label": "Quest Type",
        "kind": "select",
        "required": false,
        "options": ["Main Quest", "Side Quest", "Fetch Quest", "Escort Quest", "Kill Quest", "Investigation", "Exploration", "Social", "Other"]
      },
      {
        "key": "level",
        "label": "Recommended Level",
        "kind": "select",
        "required": false,
        "options": ["1-3", "4-6", "7-10", "11-15", "16-20", "Any"]
      },
      {
        "key": "status",
        "label": "Status",
        "kind": "select",
        "required": false,
        "options": ["Not Started", "Available", "In Progress", "Completed", "Failed", "On Hold"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this quest including the objective, background, and what makes it interesting."
      },
      {
        "key": "objectives",
        "label": "Objectives",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "rewards",
        "label": "Rewards",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "giver",
        "label": "Quest Giver",
        "kind": "reference",
        "ref_type": "NPC",
        "required": false
      },
      {
        "key": "location",
        "label": "Main Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      }
    ]'::jsonb)
  RETURNING 
    CASE WHEN name = 'Event' THEN id END,
    CASE WHEN name = 'NPC' THEN id END,
    CASE WHEN name = 'Quest' THEN id END
  INTO type_event, type_npc, type_quest;

  -- Get the card type IDs
  SELECT id INTO type_event FROM public.card_types WHERE world_id = setup_world_defaults.world_id AND name = 'Event';
  SELECT id INTO type_npc FROM public.card_types WHERE world_id = setup_world_defaults.world_id AND name = 'NPC';
  SELECT id INTO type_quest FROM public.card_types WHERE world_id = setup_world_defaults.world_id AND name = 'Quest';

  -- Create starter cards to help users get started
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, slug, summary, position) VALUES
    -- Welcome/Getting Started cards
    (gen_random_uuid(), world_id, folder_lore, type_event, 'Getting Started', 'getting-started', 'Welcome to your new world! This is an example card to help you get started.', 0),
    
    -- Example Character
    (gen_random_uuid(), world_id, folder_characters, type_character, 'The Protagonist', 'the-protagonist', 'Your main character - customize this card or create new ones!', 0),
    
    -- Example Location
    (gen_random_uuid(), world_id, folder_locations, type_location, 'The Starting Village', 'the-starting-village', 'Where your adventure begins - a small but welcoming settlement.', 0),
    
    -- Example NPC
    (gen_random_uuid(), world_id, folder_npcs, type_npc, 'The Friendly Innkeeper', 'the-friendly-innkeeper', 'A helpful NPC who provides information and shelter to travelers.', 0),
    
    -- Example Quest
    (gen_random_uuid(), world_id, folder_quests, type_quest, 'The Missing Cat', 'the-missing-cat', 'A simple starter quest - help someone find their lost pet.', 0),
    
    -- Lore starter
    (gen_random_uuid(), world_id, folder_lore, type_event, 'The Great Beginning', 'the-great-beginning', 'How your world came to be - the creation myth or founding event.', 1);

  -- Add some sample data to the cards
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    -- Getting Started card data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'getting-started'), 'description', '{"value": "Welcome to WorldWeaver! This is your new world, ready to be filled with amazing characters, locations, and stories.\n\n**Getting Started Tips:**\n- Click on any card to edit it\n- Use the + button to create new cards\n- Organize your content using the folders on the left\n- Use the AI assistant to help generate content\n- Connect related cards by referencing them in fields\n\nFeel free to delete this card once you''re comfortable with the system!"}'),
    
    -- Protagonist data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-protagonist'), 'appearance', '{"value": "A young adventurer with determination in their eyes and a mysterious past."}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-protagonist'), 'personality', '{"value": "Brave, curious, and always willing to help those in need. Has a tendency to get into trouble but always means well."}'),
    
    -- Starting Village data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-starting-village'), 'population', '{"value": 200}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-starting-village'), 'type', '{"value": "Village"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-starting-village'), 'description', '{"value": "A peaceful village nestled in a green valley, surrounded by farms and friendly faces. The perfect place to begin an adventure."}'),
    
    -- Innkeeper data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-friendly-innkeeper'), 'role', '{"value": "Innkeeper & Information Broker"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-friendly-innkeeper'), 'disposition', '{"value": "Friendly"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-friendly-innkeeper'), 'description', '{"value": "A warm, welcoming person who knows everyone in town and always has a story to share. Runs the local inn and tavern."}'),
    
    -- Quest data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'type', '{"value": "Side Quest"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'level', '{"value": "1-3"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'status', '{"value": "Available"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'description', '{"value": "Mrs. Henderson''s beloved cat Whiskers has gone missing. Last seen near the old mill. A simple quest perfect for beginning adventurers."}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'objectives', '{"value": "1. Talk to Mrs. Henderson\n2. Search the area around the old mill\n3. Find Whiskers\n4. Return the cat safely"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-missing-cat'), 'rewards', '{"value": "- 10 gold pieces\n- Mrs. Henderson''s famous apple pie\n- Reputation in the village"}'),
    
    -- Creation myth data
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-great-beginning'), 'type', '{"value": "Founding"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-great-beginning'), 'importance', '{"value": "World-changing"}'),
    ((SELECT id FROM public.cards WHERE world_id = setup_world_defaults.world_id AND slug = 'the-great-beginning'), 'description', '{"value": "In the beginning, there was... (This is where your world''s creation story begins. What forces shaped your reality? Who were the first beings? What conflicts or events set everything in motion?)"}');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically set up defaults when a new world is created
-- Note: This would need to be called manually or triggered from the application
-- since we need the user_id context
