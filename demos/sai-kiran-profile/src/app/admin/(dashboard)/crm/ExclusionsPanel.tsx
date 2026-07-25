"use client";

import { useState } from "react";
import { EXCLUSION_KINDS, type ContactExclusion, type ExclusionKind } from "@/lib/crm-types";

export default function ExclusionsPanel({
  exclusions,
  onExclusionsChange,
  onFlash,
}: {
  exclusions: ContactExclusion[];
  onExclusionsChange: (v: ContactExclusion[]) => void;
  onFlash: (kind: "success" | "error", msg: string) => void;
}) {
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<ExclusionKind>("email");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/exclusions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, kind, reason: reason || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add exclusion");
      onExclusionsChange([data.exclusion, ...exclusions]);
      setValue("");
      setReason("");
      onFlash("success", `${data.exclusion.value} excluded.`);
    } catch (err) {
      onFlash("error", err instanceof Error ? err.message : "Could not add exclusion");
    }
    setBusy(false);
  }

  async function remove(id: string, val: string) {
    const previous = exclusions;
    onExclusionsChange(exclusions.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/admin/exclusions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onFlash("success", `${val} can be contacted again.`);
    } catch {
      onExclusionsChange(previous);
      onFlash("error", "Could not remove exclusion.");
    }
  }

  return (
    <>
      <div className="admin-section-card">
        <h2>Add exclusion</h2>
        <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
          Excluded addresses can never receive mail from the Inbox composer. This is enforced on
          the server, so it holds even if the address is somehow selected. Use a domain to
          suppress everyone at a company at once.
        </p>

        <form onSubmit={add}>
          <div className="admin-row">
            <div className="admin-field" style={{ marginBottom: 0, minWidth: 120 }}>
              <label>Type</label>
              <select
                className="admin-select"
                value={kind}
                onChange={(e) => setKind(e.target.value as ExclusionKind)}
              >
                {EXCLUSION_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k === "email" ? "Email address" : "Whole domain"}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ marginBottom: 0, flex: 1 }}>
              <label>{kind === "email" ? "Email address" : "Domain"}</label>
              <input
                className="admin-input"
                type="text"
                required
                placeholder={kind === "email" ? "someone@example.com" : "example.com"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-field">
            <label>Reason (optional)</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. asked not to be contacted"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button className="admin-btn primary" type="submit" disabled={busy || !value.trim()}>
            {busy ? "Adding…" : "Add exclusion"}
          </button>
        </form>
      </div>

      {exclusions.length === 0 ? (
        <div className="admin-empty">Nothing excluded yet.</div>
      ) : (
        <div className="admin-section-card">
          <h2>Excluded ({exclusions.length})</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Added</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {exclusions.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.value}</strong>
                    </td>
                    <td>
                      <span className="admin-badge">{e.kind}</span>
                    </td>
                    <td className="admin-muted-text">{e.reason || "—"}</td>
                    <td className="admin-muted-text">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="admin-btn ghost" onClick={() => remove(e.id, e.value)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
