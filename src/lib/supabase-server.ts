import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Creates a Supabase client with the Service Role key.
 * This client has admin privileges and bypasses Row Level Security.
 * DO NOT use this client on the client-side.
 */
let hasLoggedError = false;

export function getAdminClient() {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    if (!hasLoggedError) {
      console.error("[Supabase Admin] Missing URL or Service Role Key - Admin operations will fail");
      hasLoggedError = true;
    }
    return null;
  }

  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
