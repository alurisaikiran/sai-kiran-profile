"use client";

import { TextField, TagField, ImageField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import type { LaunchedContent, LaunchedSectionContent } from "@/lib/content-types";

const EMPTY_HIGHLIGHT = { title: "", description: "" };

function LaunchedItemEditor({
  data,
  onChange,
  index,
}: {
  data: LaunchedContent;
  onChange: (v: LaunchedContent) => void;
  index: number;
}) {
  const highlights = data.highlights ?? [];
  const meta = data.preview?.meta ?? [];

  return (
    <>
      <div className="admin-section-card">
        <h2>Launched</h2>
        <TextField label="Badge" value={data.badge} onChange={(badge) => onChange({ ...data, badge })} />
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
        <TextField
          label="Heading link text"
          value={data.headingLink?.label ?? ""}
          onChange={(label) => onChange({ ...data, headingLink: { ...data.headingLink, label } })}
        />
        <TextField
          label="Heading link URL"
          value={data.headingLink?.href ?? ""}
          onChange={(href) => onChange({ ...data, headingLink: { ...data.headingLink, href } })}
        />
        <TextField
          label="Description"
          value={data.description}
          multiline
          onChange={(description) => onChange({ ...data, description })}
        />
        <TagField label="Tags" tags={data.tags ?? []} onChange={(tags) => onChange({ ...data, tags })} />
      </div>

      <AddButton
        label="Add Highlight"
        onClick={() => onChange({ ...data, highlights: [...highlights, { ...EMPTY_HIGHLIGHT }] })}
      />
      {highlights.map((h, i) => (
        <ListCard
          key={i}
          title={h.title || `Highlight ${i + 1}`}
          index={i}
          total={highlights.length}
          onRemove={() => onChange({ ...data, highlights: removeAt(highlights, i) })}
          onMove={(to) => onChange({ ...data, highlights: moveItem(highlights, i, to) })}
        >
          <TextField
            label="Title"
            value={h.title}
            onChange={(v) => onChange({ ...data, highlights: replaceAt(highlights, i, { ...h, title: v }) })}
          />
          <TextField
            label="Description"
            value={h.description}
            multiline
            onChange={(v) =>
              onChange({ ...data, highlights: replaceAt(highlights, i, { ...h, description: v }) })
            }
          />
        </ListCard>
      ))}

      {data.preview && (
        <div className="admin-section-card">
          <h2>Site preview</h2>
          <TextField
            label="URL shown in the bar"
            value={data.preview.url}
            onChange={(v) => onChange({ ...data, preview: { ...data.preview, url: v } })}
          />
          <TextField
            label="Link"
            value={data.preview.href}
            onChange={(v) => onChange({ ...data, preview: { ...data.preview, href: v } })}
          />
          <ImageField
            label="Screenshot"
            value={data.preview.image}
            onChange={(v) => onChange({ ...data, preview: { ...data.preview, image: v } })}
          />
          <TextField
            label="Image alt text"
            value={data.preview.imageAlt}
            onChange={(v) => onChange({ ...data, preview: { ...data.preview, imageAlt: v } })}
          />

          <h2 style={{ marginTop: 24 }}>Meta rows</h2>
          {meta.map((m, i) => (
            <div className="admin-row" key={i}>
              <TextField
                label="Label"
                value={m.label}
                onChange={(v) =>
                  onChange({
                    ...data,
                    preview: { ...data.preview, meta: replaceAt(meta, i, { ...m, label: v }) },
                  })
                }
              />
              <TextField
                label="Value"
                value={m.value}
                onChange={(v) =>
                  onChange({
                    ...data,
                    preview: { ...data.preview, meta: replaceAt(meta, i, { ...m, value: v }) },
                  })
                }
              />
              <button
                type="button"
                className="admin-btn ghost"
                onClick={() =>
                  onChange({ ...data, preview: { ...data.preview, meta: removeAt(meta, i) } })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() =>
              onChange({
                ...data,
                preview: { ...data.preview, meta: [...meta, { label: "", value: "" }] },
              })
            }
          >
            + Add Meta Row
          </button>
        </div>
      )}
    </>
  );
}

export default function LaunchedEditor({
  data,
  onChange,
}: {
  data: LaunchedSectionContent;
  onChange: (v: LaunchedSectionContent) => void;
}) {
  return (
    <>
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="admin-section-card" style={{ marginBottom: 0 }}>
            <h2>Launched Site {idx + 1}</h2>
          </div>
          <LaunchedItemEditor
            data={item}
            index={idx}
            onChange={(updated) => {
              const next = [...data];
              next[idx] = updated;
              onChange(next);
            }}
          />
        </div>
      ))}
    </>
  );
}
