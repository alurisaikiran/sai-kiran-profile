"use client";

import { useState } from "react";
import Link from "next/link";
import type { Contact } from "@/lib/crm-types";

interface GmailMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
}

/**
 * Shows the Gmail history for one contact. Messages are fetched live per
 * contact via a Gmail search query — nothing is stored locally.
 */
export default function ConversationsPanel({
  contacts,
  gmailConnected,
  onFlash,
}: {
  contacts: Contact[];
  gmailConnected: boolean;
  onFlash: (kind: "success" | "error", msg: string) => void;
}) {
  const [selected, setSelected] = useState<string>("");
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const people = Array.from(new Map(contacts.map((c) => [c.email, c])).values());

  async function load(email: string) {
    setSelected(email);
    setMessages([]);
    setSearched(false);
    if (!email) return;

    setLoading(true);
    try {
      // Anything to or from this address, in either direction.
      const q = encodeURIComponent(`from:${email} OR to:${email}`);
      const res = await fetch(`/api/admin/gmail/messages?limit=25&q=${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load conversation");
      setMessages(data.messages);
      setSearched(true);
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Could not load conversation");
    }
    setLoading(false);
  }

  if (!gmailConnected) {
    return (
      <div className="admin-section-card">
        <h2>Gmail not connected</h2>
        <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Connect Gmail to see your email history with each contact here.
        </p>
        <Link className="admin-btn primary" href="/admin/settings">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (people.length === 0) {
    return <div className="admin-empty">No contacts yet, so there are no conversations to show.</div>;
  }

  return (
    <div className="admin-section-card">
      <div className="admin-field">
        <label>Contact</label>
        <select
          className="admin-select"
          value={selected}
          onChange={(e) => load(e.target.value)}
          style={{ maxWidth: 420 }}
        >
          <option value="">Pick a contact…</option>
          {people.map((c) => (
            <option key={c.email} value={c.email}>
              {c.name ? `${c.name} · ${c.email}` : c.email}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-empty">Loading conversation…</div>
      ) : !selected ? (
        <div className="admin-empty">Pick a contact to see your email history with them.</div>
      ) : searched && messages.length === 0 ? (
        <div className="admin-empty">No emails found with {selected}.</div>
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
                  <td>{m.fromName || m.fromEmail}</td>
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
