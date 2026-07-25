import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth";
import { getOAuthEnv, getTokens } from "@/lib/gmail";
import { isGroqConfigured } from "@/lib/groq";
import GmailConnection from "./GmailConnection";
import ResumeUpload, { type StoredResume } from "./ResumeUpload";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string; gmail_error?: string }>;
}) {
  const params = await searchParams;
  const auth = await requireAuth();
  const tokens = auth ? await getTokens(auth.supabase, auth.user.id) : null;

  const { data: resume } = auth
    ? await auth.supabase
        .from("resumes")
        .select("id, filename, size_bytes, created_at")
        .eq("is_current", true)
        .maybeSingle()
    : { data: null };

  // Resolve the same origin the OAuth routes will use, so the page can show
  // the exact redirect URI that must be registered in Google Cloud.
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const redirectUri = getOAuthEnv(`${proto}://${host}`)?.redirectUri ?? `${proto}://${host}/api/admin/gmail/callback`;

  return (
    <>
      <div className="admin-topbar">
        <h1>Settings</h1>
        <span className="admin-muted-text">{auth?.user.email}</span>
      </div>

      <div className="admin-content">
        <GmailConnection
          configured={Boolean(getOAuthEnv(`${proto}://${host}`))}
          connectedEmail={tokens?.access_token ? tokens.email : null}
          justConnected={params.gmail === "connected"}
          error={params.gmail_error ?? null}
          redirectUri={redirectUri}
        />

        <ResumeUpload resume={(resume as StoredResume | null) ?? null} />

        <div className="admin-section-card">
          <h2>AI drafting</h2>
          <p className="admin-muted-text" style={{ lineHeight: 1.7 }}>
            {isGroqConfigured()
              ? "Groq is configured. You can draft email copy from a short brief on the Inbox → Compose tab. Every draft is editable and still goes through the review step before sending."
              : "Groq is not configured. Set GROQ_API_KEY in your environment to draft email copy with AI."}
          </p>
        </div>
      </div>
    </>
  );
}
