"use client";

import { useMemo, useState } from "react";
import {
  CONTACT_STATUSES,
  type Contact,
  type ContactStatus,
} from "@/lib/crm-types";

type Filter = "all" | ContactStatus;

export default function CrmTable({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? contacts : contacts.filter((c) => c.status === filter)),
    [contacts, filter]
  );

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function patch(id: string, body: { status?: ContactStatus; notes?: string }) {
    const previous = contacts;
    // Optimistic — revert if the server disagrees.
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...body } : c)));
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Update failed");
    } catch (err) {
      setContacts(previous);
      flash("error", err instanceof Error ? err.message : "Update failed");
    }
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete the contact record for ${email}? This can't be undone.`)) return;
    const previous = contacts;
    setContacts((cs) => cs.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      flash("success", "Contact deleted.");
    } catch {
      setContacts(previous);
      flash("error", "Could not delete contact.");
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: contacts.length };
    for (const s of CONTACT_STATUSES) c[s] = contacts.filter((x) => x.status === s).length;
    return c;
  }, [contacts]);

  return (
    <>
      <div className="admin-topbar">
        <h1>CRM</h1>
        <span className="admin-muted-text">
          {contacts.length} contact{contacts.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="admin-content">
        {notice && <div className={`admin-notice ${notice.kind}`}>{notice.msg}</div>}

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
          <div className="admin-empty">
            {contacts.length === 0
              ? "No contacts yet. Submissions from the site's contact form land here."
              : "No contacts with this status."}
          </div>
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
                  {visible.map((c) => (
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
                              <p className="admin-muted-text" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                                {c.message}
                              </p>
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                      </td>
                      <td>{c.company || "—"}</td>
                      <td>
                        <span className="admin-badge">
                          {c.source === "gmail" ? "Gmail" : "Form"}
                        </span>
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
                        <button
                          className="admin-btn ghost"
                          onClick={() => remove(c.id, c.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
