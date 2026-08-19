import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — content and admin will fail until .env.local is filled in."
  );
}

/**
 * Anon-key client. RLS grants `anon` read-only access to portfolio_content,
 * so this is safe for public reads and never sees a service-role key.
 */
export function createPublicClient() {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — bypasses RLS. Only for use in server-side cron jobs
 * and background tasks that have no user session. Never expose to the client.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
export const ASSETS_BUCKET = "portfolio-assets";
