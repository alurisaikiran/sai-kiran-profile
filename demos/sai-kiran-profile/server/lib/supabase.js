import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

/**
 * Builds a Supabase client for one request.
 * Without an access token, requests hit RLS as `anon` (public reads only).
 * With one, requests hit RLS as `authenticated` — used for admin routes so
 * writes are attributed to the signed-in user instead of a privileged key.
 */
export function createSupabaseClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
}
