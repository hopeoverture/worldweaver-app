-- Database functions for WorldWeaver

-- Function to search cards with full-text search
CREATE OR REPLACE FUNCTION search_cards(
  search_term TEXT,
  target_world_id UUID,
  card_type_filter UUID DEFAULT NULL,
  folder_filter UUID DEFAULT NULL,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  world_id UUID,
  folder_id UUID,
  type_id UUID,
  title TEXT,
  slug TEXT,
  fields JSONB,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.world_id,
    c.folder_id,
    c.type_id,
    c.title,
    c.slug,
    c.fields,
    c.cover_image_url,
    c.created_at,
    c.updated_at,
    GREATEST(
      ts_rank(to_tsvector('english', c.title), plainto_tsquery('english', search_term)),
      ts_rank(to_tsvector('english', c.fields::text), plainto_tsquery('english', search_term))
    ) AS rank
  FROM public.cards c
  WHERE 
    c.world_id = target_world_id
    AND (card_type_filter IS NULL OR c.type_id = card_type_filter)
    AND (folder_filter IS NULL OR c.folder_id = folder_filter)
    AND (
      to_tsvector('english', c.title) @@ plainto_tsquery('english', search_term) OR
      to_tsvector('english', c.fields::text) @@ plainto_tsquery('english', search_term)
    )
  ORDER BY rank DESC, c.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get world summary for AI context
CREATE OR REPLACE FUNCTION get_world_summary(target_world_id UUID)
RETURNS TABLE (
  world_title TEXT,
  world_genre TEXT,
  world_summary TEXT,
  card_count BIGINT,
  recent_cards JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.title,
    w.genre,
    w.summary,
    (SELECT COUNT(*) FROM public.cards WHERE world_id = target_world_id) as card_count,
    (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'title', c.title,
          'type', ct.name,
          'fields', c.fields
        ) ORDER BY c.updated_at DESC
      ), '[]'::jsonb)
      FROM public.cards c
      JOIN public.card_types ct ON c.type_id = ct.id
      WHERE c.world_id = target_world_id
      LIMIT 10
    ) as recent_cards
  FROM public.worlds w
  WHERE w.id = target_world_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get linked cards for AI context
CREATE OR REPLACE FUNCTION get_linked_cards(target_card_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  card_type TEXT,
  relationship_label TEXT,
  direction TEXT,
  fields JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Outgoing links (from this card to others)
  SELECT 
    c.id,
    c.title,
    ct.name as card_type,
    cl.label as relationship_label,
    'outgoing' as direction,
    c.fields
  FROM public.card_links cl
  JOIN public.cards c ON cl.to_card = c.id
  JOIN public.card_types ct ON c.type_id = ct.id
  WHERE cl.from_card = target_card_id
  
  UNION ALL
  
  -- Incoming links (from other cards to this one)
  SELECT 
    c.id,
    c.title,
    ct.name as card_type,
    cl.label as relationship_label,
    'incoming' as direction,
    c.fields
  FROM public.card_links cl
  JOIN public.cards c ON cl.from_card = c.id
  JOIN public.card_types ct ON c.type_id = ct.id
  WHERE cl.to_card = target_card_id
  
  ORDER BY title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and enforce relationship limits
CREATE OR REPLACE FUNCTION check_relationship_limit(target_card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  link_count INT;
BEGIN
  SELECT COUNT(*) INTO link_count
  FROM public.card_links
  WHERE from_card = target_card_id OR to_card = target_card_id;
  
  RETURN link_count < 10; -- MVP limit from PRD
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's plan limits
CREATE OR REPLACE FUNCTION get_user_limits(target_user_id UUID)
RETURNS TABLE (
  plan TEXT,
  worlds_limit INT,
  cards_limit INT,
  seats_limit INT,
  ai_credits_limit INT,
  storage_gb_limit INT,
  current_worlds BIGINT,
  current_cards BIGINT,
  current_ai_credits BIGINT,
  current_storage_bytes BIGINT
) AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT p.plan INTO user_plan FROM public.profiles p WHERE p.id = target_user_id;
  
  RETURN QUERY
  SELECT 
    user_plan,
    CASE user_plan
      WHEN 'free' THEN 1
      WHEN 'starter' THEN 3
      WHEN 'creator' THEN 10
      WHEN 'pro' THEN 25
      WHEN 'studio' THEN 999999
      ELSE 1
    END as worlds_limit,
    CASE user_plan
      WHEN 'free' THEN 150
      WHEN 'starter' THEN 1000
      WHEN 'creator' THEN 5000
      WHEN 'pro' THEN 15000
      WHEN 'studio' THEN 25000
      ELSE 150
    END as cards_limit,
    CASE user_plan
      WHEN 'free' THEN 1
      WHEN 'starter' THEN 2
      WHEN 'creator' THEN 3
      WHEN 'pro' THEN 5
      WHEN 'studio' THEN 10
      ELSE 1
    END as seats_limit,
    CASE user_plan
      WHEN 'free' THEN 0
      WHEN 'starter' THEN 10000
      WHEN 'creator' THEN 50000
      WHEN 'pro' THEN 100000
      WHEN 'studio' THEN 250000
      ELSE 0
    END as ai_credits_limit,
    CASE user_plan
      WHEN 'free' THEN 1
      WHEN 'starter' THEN 5
      WHEN 'creator' THEN 25
      WHEN 'pro' THEN 100
      WHEN 'studio' THEN 500
      ELSE 1
    END as storage_gb_limit,
    (SELECT COUNT(*) FROM public.worlds WHERE owner_id = target_user_id) as current_worlds,
    (SELECT COUNT(*) FROM public.cards c JOIN public.worlds w ON c.world_id = w.id WHERE w.owner_id = target_user_id) as current_cards,
    COALESCE((SELECT ai_credits_used FROM public.profiles WHERE id = target_user_id), 0) as current_ai_credits,
    COALESCE((SELECT storage_bytes_used FROM public.profiles WHERE id = target_user_id), 0) as current_storage_bytes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to auto-create default folders when world is created
CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default folders for new world
  INSERT INTO public.folders (world_id, name) VALUES
    (NEW.id, 'Characters'),
    (NEW.id, 'Locations'), 
    (NEW.id, 'Items'),
    (NEW.id, 'Organizations'),
    (NEW.id, 'Events');
  
  -- Add owner as member with owner role
  INSERT INTO public.world_members (world_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default folders and membership
DROP TRIGGER IF EXISTS on_world_created ON public.worlds;
CREATE TRIGGER on_world_created
  AFTER INSERT ON public.worlds
  FOR EACH ROW EXECUTE PROCEDURE create_default_folders();
