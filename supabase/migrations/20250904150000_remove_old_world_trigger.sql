-- Remove the old trigger that creates basic folders since we now have an enhanced setup function

-- Drop the old trigger and function that created basic folders
DROP TRIGGER IF EXISTS on_world_created ON public.worlds;
DROP FUNCTION IF EXISTS create_default_folders();

-- Note: The setup_world_defaults() function now handles all world initialization
-- and is called explicitly from the application code after world creation
