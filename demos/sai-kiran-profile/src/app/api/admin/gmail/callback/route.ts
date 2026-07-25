import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exchangeCodeForTokens, saveTokens } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/gmail/callback — Google redirects here after consent.
 *
 * This is a top-level GET navigation, so the SameSite=Lax session cookie is
 * still sent and we can identify which user to store the tokens against.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const settings = new URL("/admin/settings", url);

  const auth = await requireAuth();
  if (!auth) {
    settings.searchParams.set("gmail_error", "Your session expired — sign in and try again");
    return NextResponse.redirect(settings);
  }

  const error = url.searchParams.get("error");
  if (error) {
    settings.searchParams.set("gmail_error", error);
    return NextResponse.redirect(settings);
  }

  const code = url.searchParams.get("code");
  if (!code) {
    settings.searchParams.set("gmail_error", "No authorization code returned");
    return NextResponse.redirect(settings);
  }

  const tokens = await exchangeCodeForTokens(code, url.origin);
  if ("error" in tokens) {
    settings.searchParams.set("gmail_error", tokens.error!);
    return NextResponse.redirect(settings);
  }

  // Record which mailbox was connected, so the UI can show it.
  let email: string | null = null;
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: "no-store",
    });
    if (res.ok) email = ((await res.json()) as { email?: string }).email ?? null;
  } catch {
    // Non-fatal — the connection still works without the display address.
  }

  await saveTokens(auth.supabase, auth.user.id, {
    email,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    scope: tokens.scope,
  });

  settings.searchParams.set("gmail", "connected");
  return NextResponse.redirect(settings);
}
