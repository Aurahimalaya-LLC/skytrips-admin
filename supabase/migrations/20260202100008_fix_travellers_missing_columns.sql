-- Fix missing issue_country column in travellers table
ALTER TABLE travellers ADD COLUMN IF NOT EXISTS issue_country text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
