import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Gmail OAuth + API helpers.
 *
 * Tokens live in the `integrations` table, scoped to the owning Supabase user
 * by RLS. Every call here runs through the caller's authenticated client —
 * no service-role key is involved, so RLS stays the enforcement boundary.
 */

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

const INTEGRATION_ID = "gmail";

export interface GmailTokens {
  email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
}

export function getOAuthEnv(): { clientId: string; clientSecret: string; redirectUri: string } | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const explicit = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const redirectUri = explicit || `${site.replace(/\/$/, "")}/api/admin/gmail/callback`;

  return { clientId, clientSecret, redirectUri };
}

export function buildAuthUrl(state: string): string | null {
  const env = getOAuthEnv();
  if (!env) return null;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GMAIL_SCOPES.join(" "));
  // offline + consent are what make Google hand back a refresh token.
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokens(code: string) {
  const env = getOAuthEnv();
  if (!env) return { error: "Google OAuth is not configured" };

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    return { error: body.error_description || body.error || `Google returned ${res.status}` };
  }
  return body as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
}

async function refreshAccessToken(refreshToken: string) {
  const env = getOAuthEnv();
  if (!env) return { error: "Google OAuth is not configured" };

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    return { error: body.error_description || body.error || `Google returned ${res.status}` };
  }
  return body as { access_token: string; expires_in?: number; scope?: string };
}

/* ── Token storage ── */

export async function saveTokens(
  supabase: SupabaseClient,
  userId: string,
  input: {
    email?: string | null;
    access_token: string;
    refresh_token?: string | null;
    expires_in?: number;
    scope?: string | null;
  }
) {
  await supabase.from("integrations").upsert(
    {
      id: INTEGRATION_ID,
      user_id: userId,
      email: input.email ?? null,
      access_token: input.access_token,
      refresh_token: input.refresh_token ?? null,
      expires_at: input.expires_in
        ? new Date(Date.now() + input.expires_in * 1000).toISOString()
        : null,
      scope: input.scope ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id,user_id" }
  );
}

export async function getTokens(
  supabase: SupabaseClient,
  userId: string
): Promise<GmailTokens | null> {
  const { data } = await supabase
    .from("integrations")
    .select("email, access_token, refresh_token, expires_at, scope")
    .eq("id", INTEGRATION_ID)
    .eq("user_id", userId)
    .maybeSingle();
  return (data as GmailTokens | null) ?? null;
}

export async function deleteTokens(supabase: SupabaseClient, userId: string) {
  await supabase.from("integrations").delete().eq("id", INTEGRATION_ID).eq("user_id", userId);
}

/** Returns a usable access token, refreshing it when it's near expiry. */
export async function getAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<{ token?: string; email?: string | null; error?: string }> {
  const row = await getTokens(supabase, userId);
  if (!row?.access_token) return { error: "Gmail is not connected" };

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expiresAt > Date.now() + 60_000) {
    return { token: row.access_token, email: row.email };
  }

  if (!row.refresh_token) {
    return { error: "Gmail session expired — reconnect in Settings" };
  }

  const refreshed = await refreshAccessToken(row.refresh_token);
  if ("error" in refreshed) {
    return { error: `${refreshed.error} — try reconnecting Gmail in Settings` };
  }

  await saveTokens(supabase, userId, {
    email: row.email,
    access_token: refreshed.access_token,
    refresh_token: row.refresh_token,
    expires_in: refreshed.expires_in,
    scope: refreshed.scope ?? row.scope,
  });

  return { token: refreshed.access_token, email: row.email };
}

/* ── Gmail API ── */

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
}

function header(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** Splits `Jane Doe <jane@acme.com>` into its parts. */
export function parseFrom(from: string): { name: string; email: string } {
  const angled = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (angled) {
    return {
      name: angled[1].replace(/^["']|["']$/g, "").trim(),
      email: angled[2].trim().toLowerCase(),
    };
  }
  return { name: "", email: from.trim().toLowerCase() };
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
]);

/** Best-effort company name from an email domain; null for personal providers. */
export function companyFromEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return null;
  const base = domain.replace(/\.(com|net|org|io|co|ai|dev|app)(\.[a-z]{2})?$/, "").split(".").pop();
  if (!base) return null;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function listMessages(
  accessToken: string,
  opts: { maxResults?: number; pageToken?: string; query?: string } = {}
): Promise<{ messages: GmailMessage[]; nextPageToken?: string; error?: string }> {
  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", String(Math.min(opts.maxResults ?? 25, 100)));
  if (opts.pageToken) listUrl.searchParams.set("pageToken", opts.pageToken);
  if (opts.query) listUrl.searchParams.set("q", opts.query);

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!listRes.ok) {
    return { messages: [], error: `Gmail list failed (${listRes.status})` };
  }

  const list = (await listRes.json()) as {
    messages?: Array<{ id: string }>;
    nextPageToken?: string;
  };
  if (!list.messages?.length) return { messages: [] };

  // Metadata format keeps the payload small — we only need headers here.
  const messages = await Promise.all(
    list.messages.map(async ({ id }) => {
      const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
      url.searchParams.set("format", "metadata");
      ["From", "Subject", "Date"].forEach((h) => url.searchParams.append("metadataHeaders", h));

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!res.ok) return null;

      const msg = (await res.json()) as {
        id: string;
        threadId: string;
        snippet?: string;
        payload?: { headers?: Array<{ name: string; value: string }> };
      };
      const headers = msg.payload?.headers ?? [];
      const from = header(headers, "From");
      const parsed = parseFrom(from);

      return {
        id: msg.id,
        threadId: msg.threadId,
        from,
        fromName: parsed.name,
        fromEmail: parsed.email,
        subject: header(headers, "Subject"),
        snippet: msg.snippet ?? "",
        date: header(headers, "Date"),
      } satisfies GmailMessage;
    })
  );

  return {
    messages: messages.filter((m): m is GmailMessage => m !== null),
    nextPageToken: list.nextPageToken,
  };
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function sendEmail(
  accessToken: string,
  opts: { from: string; to: string; subject: string; body: string }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const mime = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    opts.body,
  ].join("\r\n");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: toBase64Url(mime) }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: body?.error?.message || `Gmail send failed (${res.status})` };
  }
  return { ok: true, id: body.id };
}
