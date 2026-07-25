"use client";

import { TextField, TagField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import type { SkillsContent } from "@/lib/content-types";

const EMPTY_CATEGORY = { title: "", flip: true, items: [] as string[] };

export default function SkillsEditor({
  data,
  onChange,
}: {
  data: SkillsContent;
  onChange: (v: SkillsContent) => void;
}) {
  const categories = data.categories ?? [];

  return (
    <>
      <div className="admin-section-card">
        <h2>Skills</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      </div>

      <AddButton
        label="Add Category"
        onClick={() => onChange({ ...data, categories: [...categories, { ...EMPTY_CATEGORY }] })}
      />
      {categories.map((cat, i) => (
        <ListCard
          key={i}
          title={cat.title || `Category ${i + 1}`}
          index={i}
          total={categories.length}
          onRemove={() => onChange({ ...data, categories: removeAt(categories, i) })}
          onMove={(to) => onChange({ ...data, categories: moveItem(categories, i, to) })}
        >
          <TextField
            label="Title"
            value={cat.title}
            onChange={(v) => onChange({ ...data, categories: replaceAt(categories, i, { ...cat, title: v }) })}
          />
          <TagField
            label="Skills"
            tags={cat.items ?? []}
            onChange={(items) =>
              onChange({ ...data, categories: replaceAt(categories, i, { ...cat, items }) })
            }
          />
          <div className="admin-row">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={cat.flip ?? false}
                onChange={(e) =>
                  onChange({
                    ...data,
                    categories: replaceAt(categories, i, { ...cat, flip: e.target.checked }),
                  })
                }
              />
              Flip card on click
            </label>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={cat.wide ?? false}
                onChange={(e) =>
                  onChange({
                    ...data,
                    categories: replaceAt(categories, i, { ...cat, wide: e.target.checked }),
                  })
                }
              />
              Full width
            </label>
          </div>
        </ListCard>
      ))}
    </>
  );
}
