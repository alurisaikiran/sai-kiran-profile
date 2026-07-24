import { Router } from "express";
import { createSupabaseClient } from "../lib/supabase.js";

const router = Router();
const isProd = process.env.NODE_ENV === "production";

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  path: "/",
  ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success, sets httpOnly session cookies (no token in the response body).
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    // Intentionally vague — don't reveal which field was wrong.
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const { access_token, refresh_token, expires_in } = data.session;
  res.cookie("sb-access-token", access_token, cookieOpts(expires_in * 1000));
  res.cookie("sb-refresh-token", refresh_token, cookieOpts(30 * 24 * 60 * 60 * 1000));

  res.json({ ok: true });
});

/** POST /api/auth/logout — clears the session cookies. */
router.post("/logout", (_req, res) => {
  res.clearCookie("sb-access-token", cookieOpts());
  res.clearCookie("sb-refresh-token", cookieOpts());
  res.json({ ok: true });
});

export default router;
