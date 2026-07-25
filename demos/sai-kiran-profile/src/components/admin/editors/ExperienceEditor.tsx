"use client";

import { TextField, TagField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import { EMPTY_EXPERIENCE_ITEM, type ExperienceContent } from "@/lib/content-types";

export default function ExperienceEditor({
  data,
  onChange,
}: {
  data: ExperienceContent;
  onChange: (v: ExperienceContent) => void;
}) {
  const items = data.items ?? [];

  return (
    <>
      <div className="admin-section-card">
        <h2>Experience</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      </div>

      <AddButton
        label="Add Role"
        onClick={() => onChange({ ...data, items: [{ ...EMPTY_EXPERIENCE_ITEM }, ...items] })}
      />
      {items.map((item, i) => (
        <ListCard
          key={i}
          title={item.title || `Role ${i + 1}`}
          index={i}
          total={items.length}
          onRemove={() => onChange({ ...data, items: removeAt(items, i) })}
          onMove={(to) => onChange({ ...data, items: moveItem(items, i, to) })}
        >
          <TextField
            label="Date"
            value={item.date}
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, date: v }) })}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, title: v }) })}
          />
          <TextField
            label="Description"
            value={item.description}
            multiline
            onChange={(v) => onChange({ ...data, items: replaceAt(items, i, { ...item, description: v }) })}
          />
          <TagField
            label="Tags"
            tags={item.tags ?? []}
            onChange={(tags) => onChange({ ...data, items: replaceAt(items, i, { ...item, tags }) })}
          />
        </ListCard>
      ))}
    </>
  );
}
