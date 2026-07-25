"use client";

import { useMemo, useState } from "react";
import {
  CONTACT_STATUSES,
  isExcluded,
  type Contact,
  type ContactExclusion,
  type ContactStatus,
} from "@/lib/crm-types";

type Filter = "all" | ContactStatus;

export default function PeoplePanel({
  contacts,
  exclusions,
  onContactsChange,
  onFlash,
}: {
  contacts: Contact[];
  exclusions: ContactExclusion[];
  onContactsChange: (contacts: Contact[]) => void;
  onFlash: (kind: "success" | "error", msg: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: contacts.length };
    for (const s of CONTACT_STATUSES) c[s] = contacts.filter((x) => x.status === s).length;
    return c;
  }, [contacts]);

  async function patch(id: string, body: { status?: ContactStatus; notes?: string }) {
    const previous = contacts;
    onContactsChange(contacts.map((c) => (c.id === id ? { ...c, ...body } : c)));
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Update failed");
    } catch (err) {
      onContactsChange(previous);
      onFlash("error", err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete the contact record for ${email}? This can't be undone.`)) return;
    const previous = contacts;
    onContactsChange(contacts.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onFlash("success", "Contact deleted.");
    } catch {
      onContactsChange(previous);
      onFlash("error", "Could not delete contact.");
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="admin-empty">
        No contacts yet. Contact-form submissions land here, and you can pull more in from
        Inbox → Extract contacts.
      </div>
    );
  }

  return (
    <>
      <div className="admin-row" style={{ marginBottom: 16 }}>
        <input
          className="admin-input"
          type="search"
          placeholder="Search name, email or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-subnav">
        {(["all", ...CONTACT_STATUSES] as Filter[]).map((f) => (
          <button
            key={f}
            className={`admin-chip${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="admin-empty">No contacts match.</div>
      ) : (
        <div className="admin-section-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const suppressed = isExcluded(c.email, exclusions);
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name || "—"}</strong>
                        {c.message && (
                          <>
                            <br />
                            <button
                              className="admin-link"
                              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                            >
                              {expanded === c.id ? "Hide message" : "View message"}
                            </button>
                            {expanded === c.id && (
                              <p
                                className="admin-muted-text"
                                style={{ whiteSpace: "pre-wrap", marginTop: 8 }}
                              >
                                {c.message}
                              </p>
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                        {suppressed && (
                          <>
                            <br />
                            <span className="admin-badge">excluded</span>
                          </>
                        )}
                      </td>
                      <td>{c.company || "—"}</td>
                      <td>
                        <span className="admin-badge">{c.source === "gmail" ? "Gmail" : "Form"}</span>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          value={c.status}
                          onChange={(e) => patch(c.id, { status: e.target.value as ContactStatus })}
                        >
                          {CONTACT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s[0].toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="admin-muted-text">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="admin-btn ghost" onClick={() => remove(c.id, c.email)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
