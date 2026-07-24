"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GmailConnection({
  configured,
  connectedEmail,
  justConnected,
  error,
}: {
  configured: boolean;
  connectedEmail: string | null;
  justConnected: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    if (!confirm("Disconnect Gmail? You'll need to re-authorise to read or send mail again.")) {
      return;
    }
    setBusy(true);
    await fetch("/api/admin/gmail/disconnect", { method: "POST" });
    router.replace("/admin/settings");
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="admin-section-card">
      <h2>Gmail</h2>

      {error && <div className="admin-notice error">{error}</div>}
      {justConnected && !error && (
        <div className="admin-notice success">Gmail connected.</div>
      )}

      {!configured ? (
        <>
          <p className="admin-muted-text" style={{ lineHeight: 1.7 }}>
            Gmail isn&apos;t configured yet. Create an OAuth 2.0 client in Google Cloud Console,
            then set <code>GOOGLE_OAUTH_CLIENT_ID</code> and{" "}
            <code>GOOGLE_OAUTH_CLIENT_SECRET</code> in your environment.
          </p>
          <p className="admin-muted-text" style={{ lineHeight: 1.7, marginTop: 12 }}>
            The OAuth client needs this redirect URI allowed:
            <br />
            <code>{typeof window !== "undefined" ? window.location.origin : ""}/api/admin/gmail/callback</code>
          </p>
        </>
      ) : connectedEmail !== null ? (
        <>
          <p style={{ marginBottom: 16 }}>
            Connected as <strong>{connectedEmail || "your Google account"}</strong>
          </p>
          <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
            Read access is used to list your inbox and extract contacts. Send access is used
            only when you explicitly confirm a send — nothing is sent automatically.
          </p>
          <button className="admin-btn ghost" onClick={disconnect} disabled={busy}>
            {busy ? "Disconnecting…" : "Disconnect Gmail"}
          </button>
        </>
      ) : (
        <>
          <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
            Connect your Gmail account to read your inbox from the admin, pull contacts out of
            existing emails, and send mail to your CRM contacts.
          </p>
          <a className="admin-btn primary" href="/api/admin/gmail/auth">
            Connect Gmail
          </a>
        </>
      )}
    </div>
  );
}
