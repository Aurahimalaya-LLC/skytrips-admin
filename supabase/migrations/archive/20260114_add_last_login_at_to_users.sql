BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
CREATE INDEX IF NOT EXISTS users_last_login_at_idx ON public.users (last_login_at DESC);
COMMIT;
