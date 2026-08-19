/**
 * GET /api/admin/agent/cron
 *
 * Called by Vercel Cron at 0 13 * * * (8:00 AM EST).
 * Authenticated by the Authorization: Bearer <CRON_SECRET> header that
 * Vercel attaches automatically — never a user session.
 *
 * Steps:
 *  1. Verify the cron secret
 *  2. Build the ranked news feed
 *  3. Persist it to agent_feed_cache (service-role, bypasses RLS)
 *  4. Send an HTML digest email via the stored Gmail OAuth token
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { buildFeed } from "@/lib/agent-feed";
import { buildDigestEmail } from "@/lib/agent-email";
import { sendHtmlEmail } from "@/lib/gmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CACHE_ID = "latest";
const GMAIL_INTEGRATION_ID = "gmail";

async function refreshGoogleToken(
  refreshToken: string
): Promise<{ access_token?: string; expires_in?: number }> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return {};

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });
    if (!res.ok) return {};
    return res.json().catch(() => ({}));
  } catch {
    return {};
  }
}

export async function GET(request: Request) {
  // ── 1. Auth: Vercel sends the secret; local dev can skip with ?local=1 ──
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";
  const url = new URL(request.url);

  if (!isDev || !url.searchParams.has("local")) {
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = createServiceClient();

  // ── 2. Fetch + rank ──
  const feed = await buildFeed();

  // ── 3. Persist to cache ──
  await db.from("agent_feed_cache").upsert({
    id: CACHE_ID,
    items: feed.items,
    fetched_at: feed.fetchedAt,
    sources: feed.sources,
  });

  // ── 4. Send email digest via stored Gmail token ──
  const adminEmail =
    process.env.ADMIN_DIGEST_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? null;

  const { data: integration } = await db
    .from("integrations")
    .select("email, access_token, refresh_token, expires_at, user_id")
    .eq("id", GMAIL_INTEGRATION_ID)
    .limit(1)
    .maybeSingle();

  if (!integration?.access_token) {
    return NextResponse.json({
      ok: true,
      items: feed.items.length,
      email: "skipped — Gmail not connected",
    });
  }

  // Refresh token if expired or within 60 s of expiry.
  let accessToken = integration.access_token;
  const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0;

  if (expiresAt <= Date.now() + 60_000 && integration.refresh_token) {
    const refreshed = await refreshGoogleToken(integration.refresh_token);
    if (refreshed.access_token) {
      accessToken = refreshed.access_token;
      await db
        .from("integrations")
        .update({
          access_token: refreshed.access_token,
          expires_at: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", GMAIL_INTEGRATION_ID)
        .eq("user_id", integration.user_id);
    }
  }

  const to = adminEmail ?? integration.email ?? null;
  if (!to) {
    return NextResponse.json({
      ok: true,
      items: feed.items.length,
      email: "skipped — no recipient address (set ADMIN_DIGEST_EMAIL)",
    });
  }

  const { subject, html, text } = buildDigestEmail(feed.items, feed.fetchedAt);
  const result = await sendHtmlEmail(accessToken, {
    from: integration.email ?? "me",
    to,
    subject,
    html,
    text,
  });

  return NextResponse.json({
    ok: true,
    items: feed.items.length,
    email: result.ok ? `sent to ${to}` : `failed — ${result.error}`,
  });
}
