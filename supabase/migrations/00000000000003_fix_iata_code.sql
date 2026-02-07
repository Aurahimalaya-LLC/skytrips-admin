-- Fix for missing iata_code column
ALTER TABLE public.airports ADD COLUMN IF NOT EXISTS iata_code TEXT;
ALTER TABLE public.airlines ADD COLUMN IF NOT EXISTS iata_code TEXT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'airports' AND column_name = 'code') THEN
        UPDATE public.airports SET iata_code = code WHERE iata_code IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'airlines' AND column_name = 'code') THEN
        UPDATE public.airlines SET iata_code = code WHERE iata_code IS NULL;
    END IF;
END $$;
