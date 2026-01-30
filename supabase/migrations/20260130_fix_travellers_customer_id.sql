-- Fix travellers table by adding customer_id column
ALTER TABLE travellers 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_travellers_customer_id ON travellers(customer_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
