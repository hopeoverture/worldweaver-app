-- Seed data for development
-- This creates a simple template function to help with development

-- Function to copy card type templates to a specific world
CREATE OR REPLACE FUNCTION copy_card_type_template(
  template_name TEXT,
  target_world_id UUID,
  new_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  template_schema JSONB;
  new_type_id UUID;
  new_type_name TEXT;
BEGIN
  -- Set the name for the new card type
  new_type_name := COALESCE(new_name, template_name);
  
  -- Get the schema for the requested template
  template_schema := CASE template_name
    WHEN 'Character' THEN '[
      {
        "key": "race",
        "label": "Race/Species",
        "kind": "select",
        "required": false,
        "options": ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Dragonborn", "Other"]
      },
      {
        "key": "class",
        "label": "Class/Profession",
        "kind": "select",
        "required": false,
        "options": ["Fighter", "Wizard", "Rogue", "Cleric", "Ranger", "Barbarian", "Bard", "Sorcerer", "Warlock", "Paladin", "Other"]
      },
      {
        "key": "level",
        "label": "Level",
        "kind": "number",
        "required": false,
        "validation": {"min": 1, "max": 20}
      },
      {
        "key": "appearance",
        "label": "Physical Description",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "Describe the physical appearance of this character in vivid detail."
      },
      {
        "key": "personality",
        "label": "Personality",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "Describe the personality traits, motivations, and quirks of this character."
      },
      {
        "key": "background",
        "label": "Background/History",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Create a detailed background story for this character, including their history and motivations."
      },
      {
        "key": "abilities",
        "label": "Special Abilities",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "location",
        "label": "Current Location",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "portrait",
        "label": "Portrait",
        "kind": "image",
        "required": false
      }
    ]'::jsonb
    WHEN 'Location' THEN '[
      {
        "key": "type",
        "label": "Location Type",
        "kind": "select",
        "required": false,
        "options": ["City", "Town", "Village", "Dungeon", "Wilderness", "Building", "Landmark", "Other"]
      },
      {
        "key": "population",
        "label": "Population",
        "kind": "number",
        "required": false
      },
      {
        "key": "government",
        "label": "Government Type",
        "kind": "select",
        "required": false,
        "options": ["Monarchy", "Republic", "Theocracy", "Tribal", "Oligarchy", "Empire", "City-State", "Other"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this location in vivid detail, including its atmosphere, notable features, and what makes it unique."
      },
      {
        "key": "notable_features",
        "label": "Notable Features",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "List and describe the most interesting and important features of this location."
      },
      {
        "key": "threats",
        "label": "Dangers/Threats",
        "kind": "long_text",
        "required": false
      },
      {
        "key": "ruler",
        "label": "Ruler/Leader",
        "kind": "reference",
        "ref_type": "Character",
        "required": false
      },
      {
        "key": "parent_location",
        "label": "Part of",
        "kind": "reference",
        "ref_type": "Location",
        "required": false
      },
      {
        "key": "map",
        "label": "Map/Image",
        "kind": "image",
        "required": false
      }
    ]'::jsonb
    WHEN 'Magic Item' THEN '[
      {
        "key": "rarity",
        "label": "Rarity",
        "kind": "select",
        "required": false,
        "options": ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"]
      },
      {
        "key": "type",
        "label": "Item Type",
        "kind": "select",
        "required": false,
        "options": ["Weapon", "Armor", "Shield", "Ring", "Amulet", "Cloak", "Boots", "Gloves", "Staff", "Wand", "Potion", "Scroll", "Other"]
      },
      {
        "key": "attunement",
        "label": "Requires Attunement",
        "kind": "boolean",
        "required": false,
        "default": false
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this magical item in detail, including its appearance and the magical aura it emanates."
      },
      {
        "key": "properties",
        "label": "Magical Properties",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe the magical abilities and effects of this item, including any limitations or costs."
      },
      {
        "key": "history",
        "label": "History/Lore",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Create an interesting backstory for this magical item, including who created it and how it came to be."
      },
      {
        "key": "current_owner",
        "label": "Current Owner",
        "kind": "reference",
        "ref_type": "Character",
        "required": false
      },
      {
        "key": "image",
        "label": "Item Image",
        "kind": "image",
        "required": false
      }
    ]'::jsonb
    WHEN 'Organization' THEN '[
      {
        "key": "type",
        "label": "Organization Type",
        "kind": "select",
        "required": false,
        "options": ["Guild", "Noble House", "Religious Order", "Criminal Organization", "Military Unit", "Merchant Company", "Academic Institution", "Other"]
      },
      {
        "key": "size",
        "label": "Size",
        "kind": "select",
        "required": false,
        "options": ["Tiny (2-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Huge (1000+)"]
      },
      {
        "key": "influence",
        "label": "Influence Level",
        "kind": "select",
        "required": false,
        "options": ["Local", "Regional", "National", "International", "Planar"]
      },
      {
        "key": "description",
        "label": "Description",
        "kind": "rich_text",
        "required": false,
        "ai_prompt": "Describe this organization, its purpose, structure, and what makes it unique or notable."
      },
      {
        "key": "goals",
        "label": "Goals & Agenda",
        "kind": "long_text",
        "required": false,
        "ai_prompt": "What are this organizations primary goals and how do they pursue them?"
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
        "key": "symbol",
        "label": "Symbol/Heraldry",
        "kind": "image",
        "required": false
      }
    ]'::jsonb
    ELSE '[]'::jsonb
  END;
  
  -- Create the new card type
  INSERT INTO public.card_types (id, world_id, name, icon, color, schema)
  VALUES (
    gen_random_uuid(),
    target_world_id,
    new_type_name,
    CASE template_name
      WHEN 'Character' THEN 'User'
      WHEN 'Location' THEN 'MapPin'
      WHEN 'Magic Item' THEN 'Zap'
      WHEN 'Organization' THEN 'Users'
      ELSE 'FileText'
    END,
    CASE template_name
      WHEN 'Character' THEN '#3B82F6'
      WHEN 'Location' THEN '#10B981'
      WHEN 'Magic Item' THEN '#8B5CF6'
      WHEN 'Organization' THEN '#F59E0B'
      ELSE '#6B7280'
    END,
    template_schema
  )
  RETURNING id INTO new_type_id;
  
  RETURN new_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
