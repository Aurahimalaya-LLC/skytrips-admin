-- Add extra fields to travellers table for better passport data storage
ALTER TABLE travellers ADD COLUMN IF NOT EXISTS date_of_issue date;
ALTER TABLE travellers ADD COLUMN IF NOT EXISTS issue_country text;
