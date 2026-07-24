import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase";

/**
 * Supabase client bound to the request's cookies. Session tokens live in
 * httpOnly cookies managed by @supabase/ssr — never in client-readable storage.
 * Requests made through this client hit RLS as `authenticated`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware/route handlers refresh
          // the session instead, so this is safe to ignore.
        }
      },
    },
  });
}

export async function getSession(): Promise<{ email: string } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ? { email: user.email } : null;
}

/** Route-handler guard: returns the authenticated client, or null if signed out. */
export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}
