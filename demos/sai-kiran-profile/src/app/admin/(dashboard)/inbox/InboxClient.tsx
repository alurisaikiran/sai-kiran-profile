"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Contact } from "@/lib/crm-types";

interface GmailMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
}

const MAX_RECIPIENTS = 50;

type Tab = "inbox" | "compose";

export default function InboxClient({
  connected,
  connectedEmail,
  contacts,
}: {
  connected: boolean;
  connectedEmail: string | null;
  contacts: Contact[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("inbox");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 6000);
  }

  if (!connected) {
    return (
      <>
        <div className="admin-topbar">
          <h1>Inbox</h1>
        </div>
        <div className="admin-content">
          <div className="admin-section-card">
            <h2>Gmail not connected</h2>
            <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
              Connect your Gmail account to read your inbox here, extract contacts from
              existing emails, and email your CRM contacts.
            </p>
            <Link className="admin-btn primary" href="/admin/settings">
              Go to Settings
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <h1>Inbox</h1>
        <span className="admin-muted-text">{connectedEmail}</span>
      </div>

      <div className="admin-content">
        {notice && <div className={`admin-notice ${notice.kind}`}>{notice.msg}</div>}

        <div className="admin-subnav">
          <button
            className={`admin-chip${tab === "inbox" ? " active" : ""}`}
            onClick={() => setTab("inbox")}
          >
            Messages
          </button>
          <button
            className={`admin-chip${tab === "compose" ? " active" : ""}`}
            onClick={() => setTab("compose")}
          >
            Compose
          </button>
        </div>

        {tab === "inbox" ? (
          <MessageList onFlash={flash} onExtracted={() => router.refresh()} />
        ) : (
          <Compose contacts={contacts} onFlash={flash} onSent={() => router.refresh()} />
        )}
      </div>
    </>
  );
}

/* ── Messages ── */

function MessageList({
  onFlash,
  onExtracted,
}: {
  onFlash: (kind: "success" | "error", msg: string) => void;
  onExtracted: () => void;
}) {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gmail/messages?limit=25");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load messages");
      setMessages(data.messages);
      setLoaded(true);
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Could not load messages");
    }
    setLoading(false);
  }

  async function extract() {
    setExtracting(true);
    try {
      const res = await fetch("/api/admin/gmail/extract-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      onFlash(
        "success",
        `Scanned ${data.scanned} messages — added ${data.added} new contact${data.added === 1 ? "" : "s"}, skipped ${data.skipped} already known.`
      );
      onExtracted();
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Extraction failed");
    }
    setExtracting(false);
  }

  return (
    <div className="admin-section-card">
      <div className="admin-section-card-head">
        <h2>Recent messages</h2>
        <div className="admin-row" style={{ margin: 0 }}>
          <button className="admin-btn ghost" onClick={load} disabled={loading}>
            {loading ? "Loading…" : loaded ? "Refresh" : "Load inbox"}
          </button>
          <button className="admin-btn primary" onClick={extract} disabled={extracting}>
            {extracting ? "Scanning…" : "Extract contacts"}
          </button>
        </div>
      </div>

      <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Messages are read live from Gmail and never stored. &ldquo;Extract contacts&rdquo; scans your
        100 most recent messages and saves any sender not already in your CRM.
      </p>

      {!loaded ? (
        <div className="admin-empty">Hit &ldquo;Load inbox&rdquo; to fetch your recent messages.</div>
      ) : messages.length === 0 ? (
        <div className="admin-empty">No messages found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.fromName || m.fromEmail}</strong>
                    {m.fromName && (
                      <>
                        <br />
                        <span className="admin-muted-text">{m.fromEmail}</span>
                      </>
                    )}
                  </td>
                  <td>
                    {m.subject || "(no subject)"}
                    <br />
                    <span className="admin-muted-text">{m.snippet}</span>
                  </td>
                  <td className="admin-muted-text">
                    {m.date ? new Date(m.date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Compose / bulk send ── */

function Compose({
  contacts,
  onFlash,
  onSent,
}: {
  contacts: Contact[];
  onFlash: (kind: "success" | "error", msg: string) => void;
  onSent: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  // One entry per address — a repeat sender shouldn't get two copies.
  const uniqueContacts = Array.from(
    new Map(contacts.map((c) => [c.email, c])).values()
  );

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  const recipients = [...selected];
  const overLimit = recipients.length > MAX_RECIPIENTS;

  async function send() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, subject, body, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");

      if (data.failed?.length) {
        onFlash(
          "error",
          `Sent ${data.sent}, but ${data.failed.length} failed (first: ${data.failed[0].email} — ${data.failed[0].error}).`
        );
      } else {
        onFlash("success", `Sent to ${data.sent} recipient${data.sent === 1 ? "" : "s"}.`);
      }

      setConfirming(false);
      setSelected(new Set());
      setSubject("");
      setBody("");
      onSent();
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Send failed");
    }
    setSending(false);
  }

  if (confirming) {
    return (
      <div className="admin-section-card">
        <div className="admin-confirm">
          <h3>Confirm send</h3>
          <p className="admin-muted-text" style={{ lineHeight: 1.7 }}>
            This sends a separate email to each of the{" "}
            <strong>{recipients.length}</strong> address
            {recipients.length === 1 ? "" : "es"} below, from your connected Gmail account.
            Recipients can&apos;t see each other. This can&apos;t be undone.
          </p>
          <div className="admin-recipient-list">
            {recipients.map((r) => (
              <div key={r}>{r}</div>
            ))}
          </div>
        </div>

        <div className="admin-section-card" style={{ marginBottom: 16 }}>
          <h2>Subject</h2>
          <p>{subject}</p>
          <h2 style={{ marginTop: 18 }}>Message</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{body}</p>
        </div>

        <div className="admin-row" style={{ margin: 0 }}>
          <button className="admin-btn ghost" onClick={() => setConfirming(false)} disabled={sending}>
            Back
          </button>
          <button className="admin-btn primary" onClick={send} disabled={sending}>
            {sending ? "Sending…" : `Send to ${recipients.length}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-section-card">
        <h2>Recipients ({selected.size} selected)</h2>

        {uniqueContacts.length === 0 ? (
          <div className="admin-empty">
            No contacts yet. Extract them from your inbox, or wait for contact-form submissions.
          </div>
        ) : (
          <>
            <div className="admin-row" style={{ marginBottom: 12 }}>
              <button
                className="admin-btn ghost"
                onClick={() => setSelected(new Set(uniqueContacts.map((c) => c.email)))}
              >
                Select all
              </button>
              <button className="admin-btn ghost" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
            <div className="admin-recipient-list" style={{ maxHeight: 260 }}>
              {uniqueContacts.map((c) => (
                <label
                  key={c.email}
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.email)}
                    onChange={() => toggle(c.email)}
                  />
                  <span>
                    {c.name || c.email}
                    {c.name && <span className="admin-muted-text"> · {c.email}</span>}
                    {c.company && <span className="admin-muted-text"> · {c.company}</span>}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="admin-section-card">
        <h2>Message</h2>
        <div className="admin-field">
          <label>Subject</label>
          <input
            className="admin-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="admin-field">
          <label>Body</label>
          <textarea
            className="admin-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: 200 }}
          />
        </div>

        {overLimit && (
          <div className="admin-notice error">
            {recipients.length} recipients selected — the limit is {MAX_RECIPIENTS} per send.
          </div>
        )}

        <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Gmail caps sending at roughly 500 recipients/day on personal accounts. Only email people
          who expect to hear from you — unsolicited bulk mail risks your account being suspended.
        </p>

        <button
          className="admin-btn primary"
          disabled={selected.size === 0 || !subject.trim() || !body.trim() || overLimit}
          onClick={() => setConfirming(true)}
        >
          Review &amp; send
        </button>
      </div>
    </>
  );
}
