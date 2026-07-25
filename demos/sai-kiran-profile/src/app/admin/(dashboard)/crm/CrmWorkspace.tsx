"use client";

import { useState } from "react";
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
  const [tab, setTab] = useState<Tab>("people");
  const [contacts, setContacts] = useState(initialContacts);
  const [exclusions, setExclusions] = useState(initialExclusions);
  const [notice, setNotice] = useState<CrmNotice | null>(null);

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 4000);
  }

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
