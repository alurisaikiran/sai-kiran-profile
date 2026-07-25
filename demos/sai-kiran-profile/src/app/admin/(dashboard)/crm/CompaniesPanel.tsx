"use client";

import { useMemo, useState } from "react";
import type { Contact } from "@/lib/crm-types";

interface CompanyGroup {
  company: string;
  people: Contact[];
  latest: string;
}

/**
 * Companies aren't a separate table — they're derived by grouping contacts on
 * their company field, which Gmail extraction fills in from the sender's
 * email domain.
 */
export default function CompaniesPanel({ contacts }: { contacts: Contact[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = useMemo<CompanyGroup[]>(() => {
    const map = new Map<string, Contact[]>();
    for (const c of contacts) {
      const key = c.company?.trim() || "Unknown";
      const list = map.get(key);
      if (list) list.push(c);
      else map.set(key, [c]);
    }

    return [...map.entries()]
      .map(([company, people]) => ({
        company,
        people,
        latest: people.reduce(
          (max, p) => (p.created_at > max ? p.created_at : max),
          people[0].created_at
        ),
      }))
      // Biggest first, but always park "Unknown" at the bottom.
      .sort((a, b) => {
        if (a.company === "Unknown") return 1;
        if (b.company === "Unknown") return -1;
        return b.people.length - a.people.length || a.company.localeCompare(b.company);
      });
  }, [contacts]);

  if (contacts.length === 0) {
    return <div className="admin-empty">No contacts yet, so no companies to group.</div>;
  }

  return (
    <div className="admin-section-card">
      <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Grouped from each contact&apos;s company. Contacts on free email providers (gmail, outlook…)
        have no company and land under &ldquo;Unknown&rdquo;.
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>People</th>
              <th>Most recent</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.company}>
                <td>
                  <strong>{g.company}</strong>
                  {expanded === g.company && (
                    <div style={{ marginTop: 10 }}>
                      {g.people.map((p) => (
                        <div key={p.id} className="admin-muted-text" style={{ lineHeight: 1.8 }}>
                          {p.name || "—"} · <a href={`mailto:${p.email}`}>{p.email}</a>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td>{g.people.length}</td>
                <td className="admin-muted-text">{new Date(g.latest).toLocaleDateString()}</td>
                <td>
                  <button
                    className="admin-link"
                    onClick={() => setExpanded(expanded === g.company ? null : g.company)}
                  >
                    {expanded === g.company ? "Hide" : "View people"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
