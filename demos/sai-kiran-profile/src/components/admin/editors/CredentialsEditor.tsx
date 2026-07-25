"use client";

import { TextField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import { EMPTY_CREDENTIAL_ITEM, type CredentialsContent } from "@/lib/content-types";

export default function CredentialsEditor({
  data,
  onChange,
}: {
  data: CredentialsContent;
  onChange: (v: CredentialsContent) => void;
}) {
  const items = data.items ?? [];

  return (
    <>
      <div className="admin-section-card">
        <h2>Credentials</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      </div>

      <AddButton
        label="Add Credential"
        onClick={() => onChange({ ...data, items: [{ ...EMPTY_CREDENTIAL_ITEM }, ...items] })}
      />
      {items.map((item, i) => (
        <ListCard
          key={i}
          title={item.title || `Credential ${i + 1}`}
          index={i}
          total={items.length}
          onRemove={() => onChange({ ...data, items: removeAt(items, i) })}
          onMove={(to) => onChange({ ...data, items: moveItem(items, i, to) })}
        >
          <TextField
            label="Badge"
            value={item.badge}
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, badge: v }) })}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, title: v }) })}
          />
          <TextField
            label="Subtitle"
            value={item.subtitle}
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, subtitle: v }) })}
          />
        </ListCard>
      ))}
    </>
  );
}
