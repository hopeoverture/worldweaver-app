-- Initial schema for WorldWeaver
-- Based on the PRD database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  byo_openrouter_key TEXT, -- will be encrypted at rest
  byo_openai_key TEXT,     -- will be encrypted at rest
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'creator', 'pro', 'studio')),
  ai_credits_used BIGINT DEFAULT 0,
  storage_bytes_used BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worlds table
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

-- World members table (team collaboration)
CREATE TABLE public.world_members (
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (world_id, user_id)
);

-- Folders table (per world organization)
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.folders(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card types table (per world schemas)
CREATE TABLE public.card_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of field definitions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id),
  type_id UUID REFERENCES public.card_types(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  fields JSONB DEFAULT '{}'::jsonb, -- key→value map
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(world_id, slug)
);

-- Card relationships table
CREATE TABLE public.card_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  from_card UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  to_card UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_reference CHECK (from_card != to_card)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI jobs table (for async processing)
CREATE TABLE public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT CHECK (kind IN ('field_text', 'image_token', 'batch', 'export_zip')) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb, -- parameters
  status TEXT CHECK (status IN ('queued', 'running', 'succeeded', 'failed')) DEFAULT 'queued',
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage events table (for metering)
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  world_id UUID REFERENCES public.worlds(id) ON DELETE CASCADE,
  event TEXT NOT NULL, -- e.g., 'ai_tokens', 'image_gen', 'export', 'upload'
  quantity BIGINT NOT NULL DEFAULT 1,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_worlds_owner_id ON public.worlds(owner_id);
CREATE INDEX idx_world_members_user_id ON public.world_members(user_id);
CREATE INDEX idx_folders_world_id ON public.folders(world_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_card_types_world_id ON public.card_types(world_id);
CREATE INDEX idx_cards_world_id ON public.cards(world_id);
CREATE INDEX idx_cards_folder_id ON public.cards(folder_id);
CREATE INDEX idx_cards_type_id ON public.cards(type_id);
CREATE INDEX idx_cards_slug ON public.cards(slug);
CREATE INDEX idx_card_links_world_id ON public.card_links(world_id);
CREATE INDEX idx_card_links_from_card ON public.card_links(from_card);
CREATE INDEX idx_card_links_to_card ON public.card_links(to_card);
CREATE INDEX idx_comments_world_id ON public.comments(world_id);
CREATE INDEX idx_comments_card_id ON public.comments(card_id);
CREATE INDEX idx_ai_jobs_user_id ON public.ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON public.ai_jobs(status);
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX idx_usage_events_world_id ON public.usage_events(world_id);

-- Full-text search index for cards
CREATE INDEX idx_cards_title_fts ON public.cards USING gin(to_tsvector('english', title));
CREATE INDEX idx_cards_fields_fts ON public.cards USING gin(to_tsvector('english', fields::text));

-- Function to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON public.worlds FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_card_types_updated_at BEFORE UPDATE ON public.card_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_card_links_updated_at BEFORE UPDATE ON public.card_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_jobs_updated_at BEFORE UPDATE ON public.ai_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
