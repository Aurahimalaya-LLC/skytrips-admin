-- Add domain_routing column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS domain_routing JSONB DEFAULT '{
  "enabled": false,
  "mappings": [
    {"region": "Nepal", "domain": "skytrips.com.np", "countryCode": "NP"},
    {"region": "Australia", "domain": "skytrips.com.au", "countryCode": "AU"}
  ],
  "fallbackDomain": "skytripsworld.com"
}'::JSONB;

-- Update RLS if necessary (assuming existing policies cover all columns)
-- If you need to refresh the schema in the dashboard, run this.
