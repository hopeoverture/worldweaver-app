-- Complete default content setup with all card types and starter cards
-- This implements the full default content setup as specified in DEFAULT_CONTENT_SETUP.md

-- Drop the current function and create a comprehensive version
DROP FUNCTION IF EXISTS setup_world_defaults(UUID, UUID);

CREATE OR REPLACE FUNCTION setup_world_defaults(p_world_id UUID, p_user_id UUID)
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
    (gen_random_uuid(), p_world_id, 'Characters', '#3B82F6', 'Main characters, protagonists, and important figures', 0);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Locations', '#10B981', 'Places, cities, dungeons, and geographical features', 1);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Items & Artifacts', '#8B5CF6', 'Magic items, weapons, artifacts, and important objects', 2);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Organizations', '#F59E0B', 'Guilds, factions, governments, and groups', 3);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Events & History', '#EF4444', 'Historical events, timelines, and important moments', 4);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Lore & Mythology', '#8B5CF6', 'Creation myths, legends, religions, and cultural lore', 5);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'NPCs', '#06B6D4', 'Non-player characters, side characters, and supporting cast', 6);
  
  INSERT INTO public.folders (id, world_id, name, color, description, position) VALUES
    (gen_random_uuid(), p_world_id, 'Quests & Plot Hooks', '#F97316', 'Adventure ideas, plot hooks, and story threads', 7);

  -- Get folder IDs for later use
  SELECT id INTO folder_characters FROM public.folders WHERE world_id = p_world_id AND name = 'Characters';
  SELECT id INTO folder_locations FROM public.folders WHERE world_id = p_world_id AND name = 'Locations';
  SELECT id INTO folder_items FROM public.folders WHERE world_id = p_world_id AND name = 'Items & Artifacts';
  SELECT id INTO folder_organizations FROM public.folders WHERE world_id = p_world_id AND name = 'Organizations';
  SELECT id INTO folder_events FROM public.folders WHERE world_id = p_world_id AND name = 'Events & History';
  SELECT id INTO folder_lore FROM public.folders WHERE world_id = p_world_id AND name = 'Lore & Mythology';
  SELECT id INTO folder_npcs FROM public.folders WHERE world_id = p_world_id AND name = 'NPCs';
  SELECT id INTO folder_quests FROM public.folders WHERE world_id = p_world_id AND name = 'Quests & Plot Hooks';

  -- Create comprehensive card types
  
  -- 1. Character Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Character', 'User', '#3B82F6', '[
      {
        "key": "race_species",
        "label": "Race/Species",
        "kind": "text",
        "required": false
      },
      {
        "key": "class_profession",
        "label": "Class/Profession",
        "kind": "text",
        "required": false
      },
      {
        "key": "level",
        "label": "Level",
        "kind": "number",
        "required": false
      },
      {
        "key": "physical_description",
        "label": "Physical Description",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "Describe this character''s physical appearance, including height, build, distinctive features, and style."
      },
      {
        "key": "personality",
        "label": "Personality",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "Describe this character''s personality, traits, quirks, and mannerisms."
      },
      {
        "key": "background_history",
        "label": "Background/History",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Create a detailed background and history for this character."
      },
      {
        "key": "special_abilities",
        "label": "Special Abilities",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "current_location",
        "label": "Current Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "portrait",
        "label": "Portrait",
        "kind": "image_url",
        "required": false
      }
    ]'::jsonb);

  -- 2. Location Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Location', 'MapPin', '#10B981', '[
      {
        "key": "location_type",
        "label": "Location Type",
        "kind": "select",
        "required": false,
        "options": ["City", "Town", "Village", "Dungeon", "Forest", "Mountain", "Desert", "Ocean", "Ruins", "Temple", "Castle", "Other"]
      },
      {
        "key": "population",
        "label": "Population",
        "kind": "number",
        "required": false
      },
      {
        "key": "government_type",
        "label": "Government Type",
        "kind": "select",
        "required": false,
        "options": ["Monarchy", "Democracy", "Republic", "Theocracy", "Anarchy", "Tribal", "Guild-run", "Other"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this location in vivid detail, including its appearance, atmosphere, and what makes it unique."
      },
      {
        "key": "notable_features",
        "label": "Notable Features",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "dangers_threats",
        "label": "Dangers/Threats",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "ruler_leader",
        "label": "Ruler/Leader",
        "kind": "reference",
        "ref_type": "Character",
        "required": false
      },
      {
        "key": "parent_location",
        "label": "Parent Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "map_image",
        "label": "Map/Image",
        "kind": "image_url",
        "required": false
      }
    ]'::jsonb);

  -- 3. Item/Artifact Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Item/Artifact', 'Zap', '#8B5CF6', '[
      {
        "key": "rarity",
        "label": "Rarity",
        "kind": "select",
        "required": false,
        "options": ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"]
      },
      {
        "key": "item_type",
        "label": "Item Type",
        "kind": "select",
        "required": false,
        "options": ["Weapon", "Armor", "Accessory", "Consumable", "Tool", "Artifact", "Treasure", "Other"]
      },
      {
        "key": "requires_attunement",
        "label": "Requires Attunement",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this item in detail, including its appearance and how it works."
      },
      {
        "key": "magical_properties",
        "label": "Magical Properties",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "history_lore",
        "label": "History/Lore",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "What is the history and lore behind this item? Who created it and why?"
      },
      {
        "key": "current_owner",
        "label": "Current Owner",
        "kind": "reference",
        "ref_type": "Character",
        "required": false
      },
      {
        "key": "item_image",
        "label": "Item Image",
        "kind": "image_url",
        "required": false
      }
    ]'::jsonb);

  -- 4. Organization Type
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
        "kind": "reference",
        "ref_type": "Character",
        "required": false
      },
      {
        "key": "headquarters",
        "label": "Headquarters",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "symbol_heraldry",
        "label": "Symbol/Heraldry",
        "kind": "image_url",
        "required": false
      }
    ]'::jsonb);

  -- 5. Event Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Event', 'Calendar', '#EF4444', '[
      {
        "key": "date_time",
        "label": "Date/Time Period",
        "kind": "text",
        "required": false
      },
      {
        "key": "event_type",
        "label": "Event Type",
        "kind": "select",
        "required": false,
        "options": ["Battle", "Discovery", "Founding", "Disaster", "Political", "Religious", "Cultural", "Death", "Birth", "War", "Other"]
      },
      {
        "key": "historical_importance",
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
        "key": "key_participants",
        "label": "Key Participants",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "consequences_impact",
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
    ]'::jsonb);

  -- 6. NPC Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'NPC', 'User', '#06B6D4', '[
      {
        "key": "role_occupation",
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
        "key": "secret_hidden_info",
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
    ]'::jsonb);

  -- 7. Quest Type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema) VALUES
    (gen_random_uuid(), p_world_id, 'Quest', 'Target', '#F97316', '[
      {
        "key": "quest_type",
        "label": "Quest Type",
        "kind": "select",
        "required": false,
        "options": ["Main Quest", "Side Quest", "Fetch Quest", "Escort Quest", "Kill Quest", "Investigation", "Exploration", "Social", "Puzzle", "Other"]
      },
      {
        "key": "recommended_level",
        "label": "Recommended Level",
        "kind": "select",
        "required": false,
        "options": ["1-3", "4-6", "7-10", "11-15", "16-20", "Any Level"]
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
        "key": "quest_giver",
        "label": "Quest Giver",
        "kind": "reference",
        "ref_type": "NPC",
        "required": false
      },
      {
        "key": "main_location",
        "label": "Main Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      }
    ]'::jsonb);

  -- Get card type IDs for creating starter cards
  SELECT id INTO type_character FROM public.card_types WHERE world_id = p_world_id AND name = 'Character';
  SELECT id INTO type_location FROM public.card_types WHERE world_id = p_world_id AND name = 'Location';
  SELECT id INTO type_item FROM public.card_types WHERE world_id = p_world_id AND name = 'Item/Artifact';
  SELECT id INTO type_organization FROM public.card_types WHERE world_id = p_world_id AND name = 'Organization';
  SELECT id INTO type_event FROM public.card_types WHERE world_id = p_world_id AND name = 'Event';
  SELECT id INTO type_npc FROM public.card_types WHERE world_id = p_world_id AND name = 'NPC';
  SELECT id INTO type_quest FROM public.card_types WHERE world_id = p_world_id AND name = 'Quest';

  -- Create starter cards to help users understand the system
  
  -- 1. Getting Started (Event in Lore & Mythology)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_lore, type_event, 'Getting Started', 'getting-started', 'Welcome to your new world! This card shows you how WorldWeaver works.', 0);

  -- 2. The Protagonist (Character)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_characters, type_character, 'The Protagonist', 'the-protagonist', 'Your main character - customize this template or create new ones!', 0);

  -- 3. The Starting Village (Location)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_locations, type_location, 'The Starting Village', 'the-starting-village', 'Where your adventure begins - a small but welcoming settlement.', 0);

  -- 4. The Friendly Innkeeper (NPC)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_npcs, type_npc, 'The Friendly Innkeeper', 'the-friendly-innkeeper', 'A helpful NPC who provides information and shelter to travelers.', 0);

  -- 5. The Missing Cat (Quest)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_quests, type_quest, 'The Missing Cat', 'the-missing-cat', 'A simple starter quest - help someone find their lost pet.', 0);

  -- 6. The Great Beginning (Event in Lore & Mythology)
  INSERT INTO public.cards (id, world_id, folder_id, type_id, title, slug, summary, position) VALUES
    (gen_random_uuid(), p_world_id, folder_lore, type_event, 'The Great Beginning', 'the-great-beginning', 'How your world came to be - the creation myth or founding event.', 1);

  -- Add detailed sample data to the starter cards
  
  -- Getting Started card data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'getting-started'), 'event_type', '{"value": "Cultural"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'getting-started'), 'historical_importance', '{"value": "World-changing"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'getting-started'), 'description', '{"value": "**Welcome to WorldWeaver!** 🌟\n\nThis is your new world, ready to be filled with amazing characters, locations, and stories. Here''s how to get started:\n\n### Quick Start Guide\n- **Edit Cards**: Click on any card to edit its details\n- **Create Content**: Use the + button to create new cards\n- **Organize**: Use the folders on the left to organize your content\n- **AI Assistance**: Use AI prompts in fields to generate content\n- **References**: Connect related cards by referencing them in fields\n\n### Example Cards\nWe''ve created some example cards to show you how the system works:\n- **The Protagonist**: Your main character template\n- **The Starting Village**: An example location\n- **The Friendly Innkeeper**: An example NPC\n- **The Missing Cat**: A simple quest example\n- **The Great Beginning**: Your world''s creation story\n\n### Tips for Success\n1. Start with the basics: a few key locations and characters\n2. Use the AI prompts to generate rich descriptions\n3. Connect your content using references between cards\n4. Don''t worry about perfection - you can always edit later!\n\nFeel free to delete this card once you''re comfortable with the system. Happy worldbuilding! 🏰"}');

  -- Protagonist card data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'race_species', '{"value": "Human"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'class_profession', '{"value": "Adventurer"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'level', '{"value": 1}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'physical_description', '{"value": "A young adventurer with determination in their eyes and a mysterious past. Average height with a lean, athletic build from years of travel."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'personality', '{"value": "Brave, curious, and always willing to help those in need. Has a tendency to get into trouble but always means well. Quick to make friends but slow to trust with deep secrets."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-protagonist'), 'background_history', '{"value": "Born in a small village, this character always dreamed of adventure beyond the familiar fields and forests of home. After a mysterious event in their past, they set out to discover their true destiny and make their mark on the world."}');

  -- Starting Village card data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'location_type', '{"value": "Village"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'population', '{"value": 200}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'government_type', '{"value": "Other"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'description', '{"value": "A peaceful village nestled in a green valley, surrounded by farms and rolling hills. Cobblestone paths wind between cozy cottages with thatched roofs, and smoke rises lazily from chimneys. The village square features a central well and a small market where farmers sell their goods. This is the perfect place to begin an adventure - safe enough to call home, but close enough to danger to make things interesting."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'notable_features', '{"value": "- The Silver Coin Inn & Tavern (run by the Friendly Innkeeper)\n- Village well with crystal-clear water\n- Weekly market every Sevenday\n- Ancient oak tree in the center square\n- Small shrine to local protective spirits"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-starting-village'), 'dangers_threats', '{"value": "Mostly safe, though wild animals occasionally wander down from the nearby hills. Bandits are rare but not unheard of on the main road."}');

  -- Innkeeper card data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-friendly-innkeeper'), 'role_occupation', '{"value": "Innkeeper & Tavern Owner"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-friendly-innkeeper'), 'disposition', '{"value": "Friendly"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-friendly-innkeeper'), 'description', '{"value": "A warm, welcoming middle-aged person with laugh lines around their eyes and flour always somehow dusting their apron. They know everyone in town and always have a story to share with travelers. Runs the Silver Coin Inn with pride, serving the best stew for miles around."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-friendly-innkeeper'), 'motivation', '{"value": "Wants to make everyone feel welcome and at home. Takes pride in their hospitality and enjoys hearing tales from travelers."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-friendly-innkeeper'), 'secret_hidden_info', '{"value": "Used to be an adventurer in their youth. Keeps their old sword hidden behind the bar, just in case."}');

  -- Missing Cat quest data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'quest_type', '{"value": "Side Quest"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'recommended_level', '{"value": "1-3"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'status', '{"value": "Available"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'description', '{"value": "Mrs. Henderson''s beloved cat Whiskers has gone missing from the village. Last seen near the old mill by the creek, the orange tabby is known for getting into mischief but has never been gone this long. This simple quest is perfect for beginning adventurers to prove themselves to the community."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'objectives', '{"value": "1. Talk to Mrs. Henderson to learn about Whiskers\n2. Search the area around the old mill\n3. Follow any clues or tracks you find\n4. Safely retrieve Whiskers\n5. Return the cat to Mrs. Henderson"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-missing-cat'), 'rewards', '{"value": "- 10 gold pieces\n- Mrs. Henderson''s famous apple pie\n- Increased reputation in the village\n- Grateful local contact for future adventures"}');

  -- Great Beginning event data
  INSERT INTO public.card_data (card_id, field_key, value) VALUES
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-great-beginning'), 'event_type', '{"value": "Founding"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-great-beginning'), 'historical_importance', '{"value": "World-changing"}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-great-beginning'), 'description', '{"value": "**In the beginning, there was...**\n\nThis is where your world''s creation story begins. What forces shaped your reality? Who were the first beings? What conflicts or events set everything in motion?\n\n*This is a template card - edit it to reflect your world''s unique origin story. Consider:*\n\n- Was the world created by gods, natural forces, or ancient magic?\n- What was the first age like?\n- What major event or conflict shaped the early world?\n- How did different races or civilizations come to be?\n- What mysteries or legends stem from this time?\n\nYour creation myth sets the tone for everything that follows in your world."}'),
    ((SELECT id FROM public.cards WHERE world_id = p_world_id AND slug = 'the-great-beginning'), 'consequences_impact', '{"value": "The consequences of this foundational event continue to shape the world today. Ancient powers, forgotten magics, and deep-rooted conflicts all trace back to these primordial times."}');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
