import { createSupabaseClient } from "../lib/supabase.js";

/**
 * Express middleware that validates the Supabase session cookie on every
 * admin route. On success, attaches:
 *   - req.user     the Supabase auth user
 *   - req.supabase a Supabase client authenticated as that user (so RLS
 *                  scopes reads/writes/uploads to the signed-in admin)
 * Returns 401 if the cookie is missing, invalid, or expired.
 */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.["sb-access-token"];

  if (!token) {
    return res.status(401).json({ error: "Not signed in" });
  }

  const supabase = createSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = data.user;
  req.supabase = supabase;
  next();
}
