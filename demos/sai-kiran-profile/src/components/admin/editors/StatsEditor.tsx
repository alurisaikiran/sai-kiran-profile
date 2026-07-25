"use client";

import { TextField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import type { StatsContent } from "@/lib/content-types";

const EMPTY_STAT = { value: "", label: "" };

export default function StatsEditor({
  data,
  onChange,
}: {
  data: StatsContent;
  onChange: (v: StatsContent) => void;
}) {
  const items = data ?? [];

  return (
    <div>
      <AddButton label="Add Stat" onClick={() => onChange([...items, { ...EMPTY_STAT }])} />
      {items.map((stat, i) => (
        <ListCard
          key={i}
          title={`Stat ${i + 1}`}
          index={i}
          total={items.length}
          onRemove={() => onChange(removeAt(items, i))}
          onMove={(to) => onChange(moveItem(items, i, to))}
        >
          <TextField
            label="Value"
            value={stat.value}
            onChange={(v) => onChange(replaceAt(items, i, { ...stat, value: v }))}
          />
          <TextField
            label="Label"
            value={stat.label}
            onChange={(v) => onChange(replaceAt(items, i, { ...stat, label: v }))}
          />
        </ListCard>
      ))}
    </div>
  );
}
