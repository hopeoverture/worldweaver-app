-- Add global card type templates that all users can access
-- These templates provide starting points for common worldbuilding card types

-- Create a table for global card type templates
CREATE TABLE public.card_type_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS but allow everyone to read templates
ALTER TABLE public.card_type_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view card type templates" ON public.card_type_templates
  FOR SELECT USING (true);

-- Only admins can manage templates (for now, we'll use service role)
CREATE POLICY "Only service role can manage templates" ON public.card_type_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Insert comprehensive card type templates

-- CHARACTERS & PEOPLE
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Character', 'NPCs, protagonists, and other people in your world', 'User', '#3B82F6', 'Characters', '[
  {
    "key": "race_species",
    "label": "Race/Species",
    "kind": "select",
    "required": false,
    "options": ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Other"]
  },
  {
    "key": "class_profession",
    "label": "Class/Profession",
    "kind": "text",
    "required": false,
    "placeholder": "e.g., Warrior, Merchant, Scholar"
  },
  {
    "key": "age",
    "label": "Age",
    "kind": "text",
    "required": false,
    "placeholder": "e.g., 25, Ancient, Young Adult"
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
    "key": "allies",
    "label": "Allies",
    "kind": "text",
    "required": false
  },
  {
    "key": "enemies",
    "label": "Enemies",
    "kind": "text",
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
    "kind": "image",
    "required": false
  }
]'::jsonb);

INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Deity/God', 'Gods, goddesses, and divine beings', 'Crown', '#FFD700', 'Characters', '[
  {
    "key": "domain",
    "label": "Domain/Portfolio",
    "kind": "text",
    "required": false,
    "placeholder": "e.g., War, Nature, Knowledge, Death"
  },
  {
    "key": "alignment",
    "label": "Alignment",
    "kind": "select",
    "required": false,
    "options": ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"]
  },
  {
    "key": "symbol",
    "label": "Holy Symbol",
    "kind": "text",
    "required": false
  },
  {
    "key": "followers",
    "label": "Followers/Clergy",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "teachings",
    "label": "Teachings/Doctrine",
    "kind": "rich_text",
    "required": false
  },
  {
    "key": "appearance",
    "label": "Divine Appearance",
    "kind": "long_text",
    "required": false,
    "ai_prompt": "Describe how this deity appears to mortals, including their divine presence and manifestations."
  },
  {
    "key": "artifacts",
    "label": "Divine Artifacts",
    "kind": "text",
    "required": false
  },
  {
    "key": "holy_days",
    "label": "Holy Days/Festivals",
    "kind": "text",
    "required": false
  }
]'::jsonb);

-- PLACES & LOCATIONS
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Location', 'Cities, towns, buildings, and other places', 'MapPin', '#10B981', 'Places', '[
  {
    "key": "type",
    "label": "Location Type",
    "kind": "select",
    "required": false,
    "options": ["City", "Town", "Village", "Dungeon", "Wilderness", "Building", "Landmark", "Ruins", "Castle", "Temple", "Other"]
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
    "options": ["Monarchy", "Republic", "Theocracy", "Tribal", "Oligarchy", "Empire", "City-State", "Anarchy", "Other"]
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
    "key": "climate",
    "label": "Climate/Weather",
    "kind": "text",
    "required": false
  },
  {
    "key": "economy",
    "label": "Economy/Trade",
    "kind": "text",
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
]'::jsonb);

INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Plane of Existence', 'Different realms, dimensions, and planes', 'Globe', '#8B5CF6', 'Places', '[
  {
    "key": "plane_type",
    "label": "Plane Type",
    "kind": "select",
    "required": false,
    "options": ["Material Plane", "Elemental Plane", "Celestial Plane", "Infernal Plane", "Shadow Plane", "Feywild", "Astral Plane", "Ethereal Plane", "Pocket Dimension", "Other"]
  },
  {
    "key": "access_method",
    "label": "How to Access",
    "kind": "text",
    "required": false,
    "placeholder": "Portals, spells, natural phenomena"
  },
  {
    "key": "physics",
    "label": "Physical Laws",
    "kind": "long_text",
    "required": false,
    "placeholder": "How does magic, gravity, time work here?"
  },
  {
    "key": "inhabitants",
    "label": "Native Inhabitants",
    "kind": "text",
    "required": false
  },
  {
    "key": "landscape",
    "label": "Landscape/Environment",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe the alien or fantastical landscape of this plane of existence."
  },
  {
    "key": "dangers",
    "label": "Planar Dangers",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "resources",
    "label": "Unique Resources",
    "kind": "text",
    "required": false
  }
]'::jsonb);

-- ITEMS & OBJECTS
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Magic Item', 'Enchanted weapons, artifacts, and magical objects', 'Zap', '#8B5CF6', 'Items', '[
  {
    "key": "rarity",
    "label": "Rarity",
    "kind": "select",
    "required": false,
    "options": ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact", "Unique"]
  },
  {
    "key": "type",
    "label": "Item Type",
    "kind": "select",
    "required": false,
    "options": ["Weapon", "Armor", "Shield", "Ring", "Amulet", "Cloak", "Boots", "Gloves", "Staff", "Wand", "Rod", "Potion", "Scroll", "Tome", "Instrument", "Tool", "Other"]
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
    "key": "creator",
    "label": "Creator",
    "kind": "reference",
    "ref_type": "Character",
    "required": false
  },
  {
    "key": "current_owner",
    "label": "Current Owner",
    "kind": "reference",
    "ref_type": "Character",
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
    "key": "image",
    "label": "Item Image",
    "kind": "image",
    "required": false
  }
]'::jsonb);

INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Technology', 'Sci-fi gadgets, steampunk devices, and advanced technology', 'Cpu', '#06B6D4', 'Items', '[
  {
    "key": "tech_level",
    "label": "Technology Level",
    "kind": "select",
    "required": false,
    "options": ["Primitive", "Medieval", "Renaissance", "Industrial", "Modern", "Advanced", "Futuristic", "Alien"]
  },
  {
    "key": "category",
    "label": "Category",
    "kind": "select",
    "required": false,
    "options": ["Weapon", "Tool", "Vehicle", "Computer", "Communication", "Medical", "Energy", "Defense", "Exploration", "Other"]
  },
  {
    "key": "power_source",
    "label": "Power Source",
    "kind": "text",
    "required": false,
    "placeholder": "Steam, electricity, fusion, magic, etc."
  },
  {
    "key": "description",
    "label": "Description",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe this technology in detail, including its appearance and how it works."
  },
  {
    "key": "capabilities",
    "label": "Capabilities",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "limitations",
    "label": "Limitations",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "inventor",
    "label": "Inventor/Creator",
    "kind": "reference",
    "ref_type": "Character",
    "required": false
  }
]'::jsonb);

-- ORGANIZATIONS & GROUPS
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Organization', 'Guilds, governments, factions, and other groups', 'Users', '#F59E0B', 'Organizations', '[
  {
    "key": "type",
    "label": "Organization Type",
    "kind": "select",
    "required": false,
    "options": ["Guild", "Noble House", "Religious Order", "Criminal Organization", "Military Unit", "Merchant Company", "Academic Institution", "Government", "Rebel Group", "Secret Society", "Other"]
  },
  {
    "key": "size",
    "label": "Size",
    "kind": "select",
    "required": false,
    "options": ["Tiny (2-10)", "Small (11-50)", "Medium (51-200)", "Large (201-1000)", "Huge (1000+)", "Massive (10000+)"]
  },
  {
    "key": "influence",
    "label": "Influence Level",
    "kind": "select",
    "required": false,
    "options": ["Local", "Regional", "National", "International", "Planar", "Multiversal"]
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
    "key": "structure",
    "label": "Organizational Structure",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "resources",
    "label": "Resources & Assets",
    "kind": "text",
    "required": false
  },
  {
    "key": "allies",
    "label": "Allies",
    "kind": "text",
    "required": false
  },
  {
    "key": "enemies",
    "label": "Enemies",
    "kind": "text",
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
]'::jsonb);

-- EVENTS & CONCEPTS
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Event', 'Historical events, festivals, wars, and other occurrences', 'Calendar', '#EF4444', 'Events', '[
  {
    "key": "event_type",
    "label": "Event Type",
    "kind": "select",
    "required": false,
    "options": ["War", "Festival", "Natural Disaster", "Political Event", "Religious Ceremony", "Discovery", "Invention", "Treaty", "Rebellion", "Other"]
  },
  {
    "key": "date",
    "label": "Date/Time Period",
    "kind": "text",
    "required": false,
    "placeholder": "When did this happen?"
  },
  {
    "key": "duration",
    "label": "Duration",
    "kind": "text",
    "required": false,
    "placeholder": "How long did it last?"
  },
  {
    "key": "location",
    "label": "Location",
    "kind": "reference",
    "ref_type": "Location",
    "required": false
  },
  {
    "key": "description",
    "label": "Description",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe this event in detail, including what happened and its significance."
  },
  {
    "key": "participants",
    "label": "Key Participants",
    "kind": "text",
    "required": false
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
    "required": false,
    "ai_prompt": "What were the long-term effects and consequences of this event?"
  }
]'::jsonb);

INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Culture/Society', 'Cultures, societies, and civilizations', 'Globe2', '#7C3AED', 'Concepts', '[
  {
    "key": "society_type",
    "label": "Society Type",
    "kind": "select",
    "required": false,
    "options": ["Tribal", "Feudal", "Democratic", "Theocratic", "Nomadic", "Urban", "Rural", "Post-Apocalyptic", "Utopian", "Dystopian", "Other"]
  },
  {
    "key": "population",
    "label": "Population",
    "kind": "text",
    "required": false
  },
  {
    "key": "language",
    "label": "Primary Language(s)",
    "kind": "text",
    "required": false
  },
  {
    "key": "religion",
    "label": "Dominant Religion/Beliefs",
    "kind": "text",
    "required": false
  },
  {
    "key": "values",
    "label": "Cultural Values",
    "kind": "long_text",
    "required": false,
    "ai_prompt": "What values, principles, and ideals are most important to this culture?"
  },
  {
    "key": "customs",
    "label": "Customs & Traditions",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe the important customs, traditions, and social practices of this culture."
  },
  {
    "key": "arts",
    "label": "Arts & Entertainment",
    "kind": "text",
    "required": false
  },
  {
    "key": "technology_level",
    "label": "Technology Level",
    "kind": "select",
    "required": false,
    "options": ["Stone Age", "Bronze Age", "Iron Age", "Medieval", "Renaissance", "Industrial", "Modern", "Futuristic"]
  },
  {
    "key": "territory",
    "label": "Territory/Homeland",
    "kind": "reference",
    "ref_type": "Location",
    "required": false
  }
]'::jsonb);

-- CREATURES & MONSTERS
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Creature/Monster', 'Beasts, monsters, and fantastical creatures', 'Bug', '#DC2626', 'Creatures', '[
  {
    "key": "creature_type",
    "label": "Creature Type",
    "kind": "select",
    "required": false,
    "options": ["Beast", "Dragon", "Undead", "Fey", "Fiend", "Celestial", "Elemental", "Construct", "Aberration", "Humanoid", "Giant", "Monstrosity", "Plant", "Ooze", "Other"]
  },
  {
    "key": "size",
    "label": "Size",
    "kind": "select",
    "required": false,
    "options": ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]
  },
  {
    "key": "intelligence",
    "label": "Intelligence Level",
    "kind": "select",
    "required": false,
    "options": ["Mindless", "Animal", "Low", "Average", "High", "Genius", "Cosmic"]
  },
  {
    "key": "habitat",
    "label": "Natural Habitat",
    "kind": "text",
    "required": false
  },
  {
    "key": "description",
    "label": "Physical Description",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe this creatures appearance, including distinctive features and how it moves."
  },
  {
    "key": "behavior",
    "label": "Behavior & Temperament",
    "kind": "long_text",
    "required": false,
    "ai_prompt": "How does this creature behave? Is it aggressive, curious, territorial?"
  },
  {
    "key": "abilities",
    "label": "Special Abilities",
    "kind": "long_text",
    "required": false
  },
  {
    "key": "diet",
    "label": "Diet",
    "kind": "text",
    "required": false
  },
  {
    "key": "rarity",
    "label": "Rarity",
    "kind": "select",
    "required": false,
    "options": ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Extinct", "Unique"]
  },
  {
    "key": "social_structure",
    "label": "Social Structure",
    "kind": "text",
    "required": false,
    "placeholder": "Solitary, pack, herd, etc."
  }
]'::jsonb);

-- MAGIC & SUPERNATURAL
INSERT INTO public.card_type_templates (name, description, icon, color, category, schema) VALUES
('Spell/Magic', 'Spells, magical phenomena, and supernatural effects', 'Sparkles', '#A855F7', 'Magic', '[
  {
    "key": "magic_type",
    "label": "Magic Type",
    "kind": "select",
    "required": false,
    "options": ["Arcane", "Divine", "Primal", "Psionic", "Occult", "Elemental", "Blood Magic", "Ritual", "Enchantment", "Illusion", "Other"]
  },
  {
    "key": "school",
    "label": "School of Magic",
    "kind": "select",
    "required": false,
    "options": ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation", "Other"]
  },
  {
    "key": "level",
    "label": "Power Level",
    "kind": "select",
    "required": false,
    "options": ["Cantrip", "1st Level", "2nd Level", "3rd Level", "4th Level", "5th Level", "6th Level", "7th Level", "8th Level", "9th Level", "Epic", "Legendary"]
  },
  {
    "key": "components",
    "label": "Components Required",
    "kind": "text",
    "required": false,
    "placeholder": "Verbal, somatic, material components"
  },
  {
    "key": "casting_time",
    "label": "Casting Time",
    "kind": "text",
    "required": false
  },
  {
    "key": "range",
    "label": "Range",
    "kind": "text",
    "required": false
  },
  {
    "key": "duration",
    "label": "Duration",
    "kind": "text",
    "required": false
  },
  {
    "key": "description",
    "label": "Description",
    "kind": "rich_text",
    "required": false,
    "ai_prompt": "Describe what this spell does and how it appears when cast."
  },
  {
    "key": "origin",
    "label": "Origin/Creator",
    "kind": "text",
    "required": false
  }
]'::jsonb);

-- Create index for better performance
CREATE INDEX idx_card_type_templates_category ON public.card_type_templates(category);
CREATE INDEX idx_card_type_templates_name ON public.card_type_templates(name);
