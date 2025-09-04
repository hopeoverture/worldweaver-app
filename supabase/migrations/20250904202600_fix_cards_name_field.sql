-- Fix the setup_world_defaults function to include the required 'name' field for cards

CREATE OR REPLACE FUNCTION public.setup_world_defaults(p_world_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  folder_characters UUID;
  folder_locations UUID;
  folder_npcs UUID;
  folder_lore UUID;
  folder_items UUID;
  folder_organizations UUID;
  folder_quests UUID;
  folder_storylines UUID;
  
  type_character UUID;
  type_location UUID;
  type_npc UUID;
  type_event UUID;
  type_item UUID;
  type_organization UUID;
  type_quest UUID;
BEGIN
  -- Create default folders with colors and positions
  INSERT INTO public.folders (id, world_id, name, color, position) VALUES
    (gen_random_uuid(), p_world_id, 'Characters', '#3B82F6', 0),
    (gen_random_uuid(), p_world_id, 'Locations', '#10B981', 1),
    (gen_random_uuid(), p_world_id, 'NPCs', '#F59E0B', 2),
    (gen_random_uuid(), p_world_id, 'Lore & Mythology', '#8B5CF6', 3),
    (gen_random_uuid(), p_world_id, 'Items & Artifacts', '#EF4444', 4),
    (gen_random_uuid(), p_world_id, 'Organizations', '#F97316', 5),
    (gen_random_uuid(), p_world_id, 'Quests & Adventures', '#06B6D4', 6),
    (gen_random_uuid(), p_world_id, 'Storylines & Plots', '#EC4899', 7);

  -- Get folder IDs for card assignments
  SELECT id INTO folder_characters FROM public.folders WHERE world_id = p_world_id AND name = 'Characters';
  SELECT id INTO folder_locations FROM public.folders WHERE world_id = p_world_id AND name = 'Locations';
  SELECT id INTO folder_npcs FROM public.folders WHERE world_id = p_world_id AND name = 'NPCs';
  SELECT id INTO folder_lore FROM public.folders WHERE world_id = p_world_id AND name = 'Lore & Mythology';
  SELECT id INTO folder_items FROM public.folders WHERE world_id = p_world_id AND name = 'Items & Artifacts';
  SELECT id INTO folder_organizations FROM public.folders WHERE world_id = p_world_id AND name = 'Organizations';
  SELECT id INTO folder_quests FROM public.folders WHERE world_id = p_world_id AND name = 'Quests & Adventures';
  SELECT id INTO folder_storylines FROM public.folders WHERE world_id = p_world_id AND name = 'Storylines & Plots';

  -- Create comprehensive card types with rich schemas
  
  -- Character card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Character', 'User', '#3B82F6', '[
      {
        "key": "age",
        "label": "Age",
        "kind": "text",
        "required": false
      },
      {
        "key": "occupation",
        "label": "Occupation",
        "kind": "text",
        "required": false
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this character''s appearance, personality, and background."
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "motivations",
        "label": "Motivations",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "relationships",
        "label": "Relationships",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "skills_abilities",
        "label": "Skills & Abilities",
        "kind": "long_text",
        "required": false
      }
    ]'::jsonb);

  -- Location card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Location', 'MapPin', '#10B981', '[
      {
        "key": "location_type",
        "label": "Location Type",
        "kind": "select",
        "required": false,
        "options": ["City", "Town", "Village", "Forest", "Mountain", "Desert", "Ocean", "River", "Building", "Dungeon", "Ruin", "Other"]
      },
      {
        "key": "size",
        "label": "Size",
        "kind": "select",
        "required": false,
        "options": ["Tiny", "Small", "Medium", "Large", "Huge", "Massive"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this location, its appearance, atmosphere, and what makes it unique."
      },
      {
        "key": "history",
        "label": "History",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "inhabitants",
        "label": "Inhabitants",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "points_of_interest",
        "label": "Points of Interest",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "climate_geography",
        "label": "Climate & Geography",
        "kind": "long_text",
        "required": false
      }
    ]'::jsonb);

  -- NPC card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'NPC', 'Users', '#F59E0B', '[
      {
        "key": "role",
        "label": "Role",
        "kind": "text",
        "required": false
      },
      {
        "key": "personality",
        "label": "Personality",
        "kind": "select",
        "required": false,
        "options": ["Friendly", "Hostile", "Neutral", "Mysterious", "Helpful", "Suspicious", "Cheerful", "Grumpy", "Wise", "Foolish"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this NPC''s appearance, personality, and role in the world."
      },
      {
        "key": "background",
        "label": "Background",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "goals_motivations",
        "label": "Goals & Motivations",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "relationships",
        "label": "Relationships",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "notable_quotes",
        "label": "Notable Quotes",
        "kind": "long_text",
        "required": false
      }
    ]'::jsonb);

  -- Event card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Event', 'Calendar', '#8B5CF6', '[
      {
        "key": "event_type",
        "label": "Event Type",
        "kind": "select",
        "required": false,
        "options": ["Historical", "Mythological", "Ongoing", "Future", "Cyclical", "Legendary"]
      },
      {
        "key": "timeframe",
        "label": "Timeframe",
        "kind": "text",
        "required": false
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this event, what happened, who was involved, and its significance."
      },
      {
        "key": "causes",
        "label": "Causes",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "consequences",
        "label": "Consequences",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "key_figures",
        "label": "Key Figures",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "cultural_impact",
        "label": "Cultural Impact",
        "kind": "long_text",
        "required": false
      }
    ]'::jsonb);

  -- Item card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Item', 'Package', '#EF4444', '[
      {
        "key": "item_type",
        "label": "Item Type",
        "kind": "select",
        "required": false,
        "options": ["Weapon", "Armor", "Tool", "Artifact", "Potion", "Book", "Jewelry", "Currency", "Art", "Other"]
      },
      {
        "key": "rarity",
        "label": "Rarity",
        "kind": "select",
        "required": false,
        "options": ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Unique"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this item, its appearance, properties, and what makes it special."
      },
      {
        "key": "properties",
        "label": "Properties",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "history",
        "label": "History",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "location",
        "label": "Current Location",
        "kind": "text",
        "required": false
      },
      {
        "key": "value",
        "label": "Value",
        "kind": "text",
        "required": false
      }
    ]'::jsonb);

  -- Organization card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Organization', 'Users', '#F59E0B', '[
      {
        "key": "organization_type",
        "label": "Organization Type",
        "kind": "select",
        "required": false,
        "options": ["Guild", "Government", "Military", "Religious", "Criminal", "Academic", "Trade", "Secret Society", "Other"]
      },
      {
        "key": "size",
        "label": "Size",
        "kind": "select",
        "required": false,
        "options": ["Tiny (1-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Huge (1000+)"]
      },
      {
        "key": "influence_level",
        "label": "Influence Level",
        "kind": "select",
        "required": false,
        "options": ["Local", "Regional", "National", "International", "Legendary"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this organization, its purpose, structure, and role in the world."
      },
      {
        "key": "goals_agenda",
        "label": "Goals & Agenda",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "allies",
        "label": "Allies",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "enemies",
        "label": "Enemies",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "leader",
        "label": "Leader",
        "kind": "text",
        "required": false
      }
    ]'::jsonb);

  -- Quest card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Quest', 'Target', '#06B6D4', '[
      {
        "key": "quest_type",
        "label": "Quest Type",
        "kind": "select",
        "required": false,
        "options": ["Main Story", "Side Quest", "Fetch Quest", "Escort", "Investigation", "Combat", "Exploration", "Social", "Other"]
      },
      {
        "key": "difficulty",
        "label": "Difficulty",
        "kind": "select",
        "required": false,
        "options": ["Trivial", "Easy", "Medium", "Hard", "Very Hard", "Legendary"]
      },
      {
        "key": "status",
        "label": "Status",
        "kind": "select",
        "required": false,
        "options": ["Not Started", "Available", "In Progress", "Completed", "Failed", "Abandoned"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this quest, its objectives, and what the characters need to do."
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
        "kind": "text",
        "required": false
      },
      {
        "key": "time_limit",
        "label": "Time Limit",
        "kind": "text",
        "required": false
      }
    ]'::jsonb);

  -- Get card type IDs for starter cards
  SELECT id INTO type_character FROM public.card_types WHERE world_id = p_world_id AND name = 'Character';
  SELECT id INTO type_location FROM public.card_types WHERE world_id = p_world_id AND name = 'Location';
  SELECT id INTO type_npc FROM public.card_types WHERE world_id = p_world_id AND name = 'NPC';
  SELECT id INTO type_event FROM public.card_types WHERE world_id = p_world_id AND name = 'Event';
  SELECT id INTO type_item FROM public.card_types WHERE world_id = p_world_id AND name = 'Item';
  SELECT id INTO type_organization FROM public.card_types WHERE world_id = p_world_id AND name = 'Organization';
  SELECT id INTO type_quest FROM public.card_types WHERE world_id = p_world_id AND name = 'Quest';

  -- Create starter cards to help users understand the system (now with 'name' field)
  
  -- 1. Getting Started (Event in Lore & Mythology)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_lore, type_event, 'Getting Started', 'Getting Started', 'getting-started', 'Welcome to your new world! This card shows you how WorldWeaver works.', 0);

  -- 2. The Protagonist (Character)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_characters, type_character, 'The Protagonist', 'The Protagonist', 'the-protagonist', 'Your main character - customize this template or create new ones!', 0);

  -- 3. The Starting Village (Location)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_locations, type_location, 'The Starting Village', 'The Starting Village', 'the-starting-village', 'Where your adventure begins - a small but welcoming settlement.', 0);

  -- 4. The Friendly Innkeeper (NPC)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_npcs, type_npc, 'The Friendly Innkeeper', 'The Friendly Innkeeper', 'the-friendly-innkeeper', 'A helpful NPC who provides information and shelter to travelers.', 0);

  -- 5. The Missing Cat (Quest)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_quests, type_quest, 'The Missing Cat', 'The Missing Cat', 'the-missing-cat', 'A simple starter quest - help someone find their lost pet.', 0);

  -- 6. The Great Beginning (Event in Lore & Mythology)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, name, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_lore, type_event, 'The Great Beginning', 'The Great Beginning', 'the-great-beginning', 'How your world came to be - the creation myth or founding event.', 1);

END;
$$;
