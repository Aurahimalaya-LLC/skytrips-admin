-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT,
  company_email TEXT,
  company_phone TEXT,
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  notifications BOOLEAN DEFAULT true,
  logo_url TEXT,
  favicon_url TEXT,
  company_profiles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Singleton constraint
CREATE UNIQUE INDEX IF NOT EXISTS settings_singleton_idx ON settings ((TRUE));

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert settings" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
