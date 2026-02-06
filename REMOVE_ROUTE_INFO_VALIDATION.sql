-- Migration to drop strict validation trigger for route_info
-- This allows free-form text input for route details

DROP TRIGGER IF EXISTS trg_validate_route_info ON routes;
DROP FUNCTION IF EXISTS validate_route_info();

NOTIFY pgrst, 'reload schema';
