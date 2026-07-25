"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact, ContactExclusion } from "@/lib/crm-types";
import PeoplePanel from "./PeoplePanel";
import CompaniesPanel from "./CompaniesPanel";
import ConversationsPanel from "./ConversationsPanel";
import ExclusionsPanel from "./ExclusionsPanel";

const TABS = [
  { key: "people", label: "People" },
  { key: "companies", label: "Companies" },
  { key: "conversations", label: "Conversations" },
  { key: "exclude", label: "Exclude" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export interface CrmNotice {
  kind: "success" | "error";
  msg: string;
}

export default function CrmWorkspace({
  initialContacts,
  initialExclusions,
  gmailConnected,
}: {
  initialContacts: Contact[];
  initialExclusions: ContactExclusion[];
  gmailConnected: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("people");
  const [contacts, setContacts] = useState(initialContacts);
  const [exclusions, setExclusions] = useState(initialExclusions);
  const [notice, setNotice] = useState<CrmNotice | null>(null);
  const [busy, setBusy] = useState<"refresh" | "import" | null>(null);

  // Pick up rows fetched by the server after a refresh or import.
  useEffect(() => setContacts(initialContacts), [initialContacts]);
  useEffect(() => setExclusions(initialExclusions), [initialExclusions]);

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 6000);
  }

  function refresh() {
    setBusy("refresh");
    router.refresh();
    // router.refresh() has no completion signal; this just re-enables the button.
    setTimeout(() => setBusy(null), 1200);
  }

  async function importFromGmail() {
    setBusy("import");
    try {
      const res = await fetch("/api/admin/gmail/extract-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      flash(
        "success",
        `Scanned ${data.scanned} messages — added ${data.added} new contact${
          data.added === 1 ? "" : "s"
        }, skipped ${data.skipped} already known.`
      );
      router.refresh();
    } catch (err) {
      flash("error", err instanceof Error ? err.message : "Import failed");
    }
    setBusy(null);
  }

  return (
    <>
      <div className="admin-topbar">
        <h1>CRM</h1>
        <div className="admin-row" style={{ margin: 0, alignItems: "center" }}>
          <span className="admin-muted-text">
            {contacts.length} contact{contacts.length === 1 ? "" : "s"}
          </span>
          <button className="admin-btn ghost" onClick={refresh} disabled={busy !== null}>
            {busy === "refresh" ? "Refreshing…" : "Refresh"}
          </button>
          {gmailConnected && (
            <button className="admin-btn primary" onClick={importFromGmail} disabled={busy !== null}>
              {busy === "import" ? "Importing…" : "Import from Gmail"}
            </button>
          )}
        </div>
      </div>

      <div className="admin-content">
        {notice && <div className={`admin-notice ${notice.kind}`}>{notice.msg}</div>}

        <div className="admin-subnav">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`admin-chip${tab === key ? " active" : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "people" && (
          <PeoplePanel
            contacts={contacts}
            exclusions={exclusions}
            onContactsChange={setContacts}
            onFlash={flash}
          />
        )}
        {tab === "companies" && <CompaniesPanel contacts={contacts} />}
        {tab === "conversations" && (
          <ConversationsPanel contacts={contacts} gmailConnected={gmailConnected} onFlash={flash} />
        )}
        {tab === "exclude" && (
          <ExclusionsPanel
            exclusions={exclusions}
            onExclusionsChange={setExclusions}
            onFlash={flash}
          />
        )}
      </div>
    </>
  );
}
