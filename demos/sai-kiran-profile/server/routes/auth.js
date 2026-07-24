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

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Always responds ok — Supabase itself doesn't reveal whether the email
 * is registered, so neither do we.
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const supabase = createSupabaseClient();
  const redirectTo = `${req.protocol}://${req.get("host")}/admin/`;
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  res.json({ ok: true });
});

/**
 * POST /api/auth/reset-password
 * Body: { access_token, refresh_token, new_password }
 * The tokens come from the recovery link Supabase emailed the user.
 */
router.post("/reset-password", async (req, res) => {
  const { access_token, refresh_token, new_password } = req.body ?? {};
  if (!access_token || !refresh_token || !new_password) {
    return res.status(400).json({ error: "Reset link is missing required data" });
  }

  const supabase = createSupabaseClient();
  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) {
    return res.status(401).json({ error: "This reset link is invalid or expired" });
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: new_password });
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.json({ ok: true });
});

export default router;
