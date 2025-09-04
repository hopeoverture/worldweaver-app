-- Check the actual schema of the folders table
\d public.folders;

-- Check if the table has the expected columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'folders'
ORDER BY ordinal_position;
