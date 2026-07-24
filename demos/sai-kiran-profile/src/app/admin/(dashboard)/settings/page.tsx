import { requireAuth } from "@/lib/auth";
import { getOAuthEnv, getTokens } from "@/lib/gmail";
import GmailConnection from "./GmailConnection";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string; gmail_error?: string }>;
}) {
  const params = await searchParams;
  const auth = await requireAuth();
  const tokens = auth ? await getTokens(auth.supabase, auth.user.id) : null;

  return (
    <>
      <div className="admin-topbar">
        <h1>Settings</h1>
        <span className="admin-muted-text">{auth?.user.email}</span>
      </div>

      <div className="admin-content">
        <GmailConnection
          configured={Boolean(getOAuthEnv())}
          connectedEmail={tokens?.access_token ? tokens.email : null}
          justConnected={params.gmail === "connected"}
          error={params.gmail_error ?? null}
        />
      </div>
    </>
  );
}
