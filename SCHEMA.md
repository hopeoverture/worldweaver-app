# WorldWeaver Database Schema Documentation

**Last Updated:** September 4, 2025  
**Version:** 1.0  
**Database:** PostgreSQL (Supabase)

## Overview

WorldWeaver is a collaborative worldbuilding platform that allows users to create, organize, and share fictional worlds with rich content management capabilities.

## Core Tables

### 1. Authentication & Users

#### `auth.users` (Supabase managed)
Built-in Supabase authentication table.

#### `public.profiles`
Extends auth.users with application-specific data.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  byo_openrouter_key TEXT, -- encrypted at rest
  byo_openai_key TEXT,     -- encrypted at rest
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'creator', 'pro', 'studio')),
  ai_credits_used BIGINT DEFAULT 0,
  storage_bytes_used BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Worlds & Collaboration

#### `public.worlds`
Main worlds table - each world is a contained universe of content.

```sql
CREATE TABLE public.worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  genre TEXT,
  summary TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Visibility Options:**
- `private`: Only owner can see/edit
- `shared`: Owner can invite collaborators
- `public`: Anyone can view (read-only)

#### `public.world_members`
Team collaboration - who has access to which worlds.

```sql
CREATE TABLE public.world_members (
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (world_id, user_id)
);
```

**Roles:**
- `owner`: Full control, can delete world, manage members
- `editor`: Can create/edit content, cannot manage members
- `viewer`: Read-only access

### 3. Content Organization

#### `public.folders`
Hierarchical organization system for content within worlds.

```sql
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.folders(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  description TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Folders Created by `setup_world_defaults()`:**
1. Characters (#3B82F6) - Main characters, protagonists, and important figures
2. Locations (#10B981) - Places, cities, dungeons, and geographical features
3. Items & Artifacts (#8B5CF6) - Magic items, weapons, artifacts, and important objects
4. Organizations (#F59E0B) - Guilds, factions, governments, and groups
5. Events & History (#EF4444) - Historical events, timelines, and important moments
6. Lore & Mythology (#8B5CF6) - Creation myths, legends, religions, and cultural lore
7. NPCs (#06B6D4) - Non-player characters, side characters, and supporting cast
8. Quests & Plot Hooks (#F97316) - Adventure ideas, plot hooks, and story threads

#### `public.card_types`
Schema definitions for different types of content cards.

```sql
CREATE TABLE public.card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#6B7280',
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Schema Field Types:**
- `text`: Short text input
- `long_text`: Multi-line text area
- `rich_text`: Rich text editor with formatting
- `number`: Numeric input
- `select`: Dropdown with predefined options
- `multi_select`: Multiple selection from options
- `checkbox`: Boolean value
- `date`: Date picker
- `reference`: Link to another card
- `file`: File upload
- `image`: Image upload

**Schema Field Structure:**
```json
{
  "key": "field_name",
  "label": "Display Name",
  "kind": "text|long_text|rich_text|number|select|multi_select|checkbox|date|reference|file|image",
  "required": true|false,
  "options": ["option1", "option2"], // for select/multi_select
  "ref_type": "Card Type Name", // for reference fields
  "ai_prompt": "Prompt for AI assistance" // optional
}
```

#### `public.card_type_templates`
Global templates for common card types that can be copied to worlds.

```sql
CREATE TABLE public.card_type_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#6B7280',
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Content Management

#### `public.cards`
Individual content items - the core building blocks of worlds.

```sql
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  type_id UUID REFERENCES public.card_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(world_id, slug)
);
```

#### `public.card_data`
Dynamic field data for cards based on their type schemas.

```sql
CREATE TABLE public.card_data (
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (card_id, field_key)
);
```

**Value Structure:**
```json
{
  "value": "actual content",
  "references": ["card_id1", "card_id2"], // for reference fields
  "metadata": {} // additional metadata
}
```

#### `public.card_links`
Explicit relationships between cards for advanced querying.

```sql
CREATE TABLE public.card_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  from_card UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  to_card UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT DEFAULT 'reference',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_card, to_card, relationship_type)
);
```

### 5. Collaboration Features

#### `public.comments`
Comments and discussions on cards.

```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. System Tables

#### `public.ai_tasks`
Background AI generation tasks.

```sql
CREATE TABLE public.ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT CHECK (kind IN ('field_text', 'image_token', 'batch', 'export_zip')) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('queued', 'running', 'succeeded', 'failed')) DEFAULT 'queued',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `public.usage_events`
Usage tracking for metering and analytics.

```sql
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  event TEXT NOT NULL, -- 'ai_tokens', 'image_gen', 'export', 'upload'
  quantity BIGINT NOT NULL DEFAULT 1,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Functions

### `setup_world_defaults(p_world_id UUID, p_user_id UUID)`
Automatically creates default content structure for new worlds:
- 8 categorized folders with colors and descriptions
- Basic Character and Location card types from templates
- Welcome card with getting started information

### `copy_card_type_template(template_name TEXT, world_id UUID, override_name TEXT DEFAULT NULL)`
Copies a global card type template to a specific world with optional name override.

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to access only worlds they own or are members of
- Respect world visibility settings for public worlds
- Prevent unauthorized access to private content

## Indexes

Performance indexes are created on:
- Foreign key relationships
- Frequently queried columns (world_id, user_id, slug)
- Composite indexes for common query patterns

## Migration Files

1. `20250903000001_initial_schema.sql` - Core table structure
2. `20250903000002_rls_policies.sql` - Row level security policies
3. `20250903000003_functions.sql` - Basic functions and triggers
4. `20250903000004_seed_data.sql` - Initial seed data
5. `20250903000005_fix_rls_recursion.sql` - RLS policy fixes
6. `20250903000006_simplify_worlds_policy.sql` - Simplified world access
7. `20250903234753_add_description_to_card_types.sql` - Added descriptions
8. `20250904001806_add_global_card_type_templates.sql` - Global templates
9. `20250904002919_fix_card_types_rls_policies.sql` - Template access policies
10. `20250904003000_add_folder_color.sql` - Folder colors and descriptions
11. `20250904004000_fix_schema_mismatches.sql` - Schema consistency fixes
12. `20250904010000_world_defaults.sql` - World defaults function
13. `20250904143002_fix_world_defaults_function.sql` - Function fixes
14. `20250904144000_fix_world_defaults_ambiguity.sql` - Parameter name fixes
15. `20250904145000_fix_card_title_requirement.sql` - Fix card title/name requirements
16. `20250904150000_remove_old_world_trigger.sql` - Remove duplicate folder creation trigger

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Direct Connection
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Development Setup

1. **Start Supabase:** `npx supabase start`
2. **Reset Database:** `npx supabase db reset --local`
3. **Check Status:** `npx supabase status`
4. **Studio URL:** http://127.0.0.1:54323

## Important Notes

- All UUIDs are generated using `gen_random_uuid()`
- Timestamps use `TIMESTAMPTZ` for proper timezone handling
- JSONB is used for flexible schema storage
- Slugs must be unique within each world
- Foreign key cascades are carefully designed to maintain data integrity
- The system supports both hierarchical folders and flat organization
- AI features are built-in but optional
- Export/import capabilities are designed into the schema
- The system is designed for multi-tenant SaaS deployment

## Future Considerations

- **Versioning:** Card history and version tracking
- **Templates:** World-level templates and sharing
- **Advanced AI:** More sophisticated AI task types
- **Real-time:** Collaborative editing features
- **Search:** Full-text search capabilities
- **Analytics:** Enhanced usage tracking and insights
