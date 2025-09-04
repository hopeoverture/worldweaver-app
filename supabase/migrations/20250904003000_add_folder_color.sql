-- Add color column to folders table
ALTER TABLE public.folders 
ADD COLUMN color TEXT DEFAULT 'blue';

-- Update existing folders to have default blue color
UPDATE public.folders 
SET color = 'blue' 
WHERE color IS NULL;
