"use client";

import { useEffect, useRef, useState } from "react";
import DateRangePicker from "./DateRangePicker";
import {
  DEFAULT_RANGE,
  buildDateQuery,
  describeRange,
  relativeTime,
  type DateRange,
} from "@/lib/gmail-query";

export interface GmailMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  date: string;
}

const PAGE_SIZE = 25;

/**
 * Results are cached per browser tab so switching admin pages doesn't throw
 * the inbox away and force a manual reload. sessionStorage (not local) keeps
 * this to the current tab and clears it on close; sign-out clears it too.
 * Anything older than the TTL is refetched rather than shown as current.
 */
export const INBOX_CACHE_KEY = "sk_admin_inbox_v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface InboxCache {
  messages: GmailMessage[];
  nextPageToken: string | null;
  fetchedAt: number;
  range: DateRange;
}

function readCache(): InboxCache | null {
  try {
    const raw = sessionStorage.getItem(INBOX_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as InboxCache;
    if (Date.now() - cache.fetchedAt > CACHE_TTL_MS) return null;
    return cache;
  } catch {
    return null;
  }
}

function writeCache(cache: InboxCache) {
  try {
    sessionStorage.setItem(INBOX_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Quota or private-mode failures are not worth surfacing.
  }
}

export default function MessageList({
  onFlash,
  onExtracted,
}: {
  onFlash: (kind: "success" | "error", msg: string) => void;
  onExtracted: () => void;
}) {
  const [range, setRange] = useState<DateRange>({ preset: DEFAULT_RANGE });
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  async function load(pageToken?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      const q = buildDateQuery(range);
      if (q) params.set("q", q);
      if (pageToken) params.set("pageToken", pageToken);

      const res = await fetch(`/api/admin/gmail/messages?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load messages");

      // A page token means we're appending, otherwise this is a fresh query.
      setMessages((prev) => (pageToken ? [...prev, ...data.messages] : data.messages));
      setNextPageToken(data.nextPageToken ?? null);
      setFetchedAt(new Date());
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
        body: JSON.stringify({ limit: 200, query: buildDateQuery(range) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      onFlash(
        "success",
        `Scanned ${data.scanned} messages from ${describeRange(range)} — added ${
          data.added
        } new contact${data.added === 1 ? "" : "s"}, skipped ${data.skipped} already known.`
      );
      onExtracted();
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Extraction failed");
    }
    setExtracting(false);
  }

  // Actual span of what came back, which can be narrower than the range asked for.
  const dates = messages
    .map((m) => (m.date ? new Date(m.date) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  const oldest = dates[0];
  const newest = dates[dates.length - 1];

  const busy = loading || extracting;

  return (
    <div className="admin-section-card">
      <div className="admin-section-card-head">
        <h2>Inbox</h2>
        <div className="admin-row" style={{ margin: 0 }}>
          <button className="admin-btn ghost" onClick={() => load()} disabled={busy}>
            {loading ? "Loading…" : fetchedAt ? "Refresh" : "Load messages"}
          </button>
          <button className="admin-btn primary" onClick={extract} disabled={busy}>
            {extracting ? "Scanning…" : "Extract contacts"}
          </button>
        </div>
      </div>

      <DateRangePicker value={range} onChange={setRange} disabled={busy} />

      <p className="admin-muted-text" style={{ lineHeight: 1.7, margin: "16px 0" }}>
        Messages are read live from Gmail and never stored. &ldquo;Extract contacts&rdquo; scans up to
        200 messages in the selected range and saves any sender not already in your CRM.
      </p>

      {fetchedAt && (
        <div className="admin-fetch-meta">
          <span>
            <strong>{messages.length}</strong> message{messages.length === 1 ? "" : "s"}
            {oldest && newest && (
              <>
                {" "}
                from <strong>{oldest.toLocaleDateString()}</strong> to{" "}
                <strong>{newest.toLocaleDateString()}</strong>
              </>
            )}
          </span>
          <span title={fetchedAt.toLocaleString()}>
            Pulled {relativeTime(fetchedAt)} · {fetchedAt.toLocaleTimeString()}
          </span>
        </div>
      )}

      {!fetchedAt ? (
        <div className="admin-empty">
          Pick a range and hit &ldquo;Load messages&rdquo;.
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-empty">No messages in {describeRange(range)}.</div>
      ) : (
        <>
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
                    <td className="admin-muted-text" style={{ whiteSpace: "nowrap" }}>
                      {m.date ? new Date(m.date).toLocaleDateString() : "—"}
                      <br />
                      {m.date ? new Date(m.date).toLocaleTimeString() : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {nextPageToken && (
            <div style={{ marginTop: 16 }}>
              <button
                className="admin-btn ghost"
                onClick={() => load(nextPageToken)}
                disabled={busy}
              >
                {loading ? "Loading…" : `Load ${PAGE_SIZE} more`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
