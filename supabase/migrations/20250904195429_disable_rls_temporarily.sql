-- Temporarily disable RLS to test basic functionality
-- This will help us isolate the issue and test the application

-- Disable RLS on all tables temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean state
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                          policy_record.policyname, 
                          policy_record.schemaname, 
                          policy_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Continue even if drop fails
            NULL;
        END;
    END LOOP;
END $$;
