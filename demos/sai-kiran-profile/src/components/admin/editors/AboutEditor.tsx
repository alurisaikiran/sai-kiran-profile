"use client";

import { TextField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import type { AboutContent } from "@/lib/content-types";

const EMPTY_CARD = { number: "", title: "", description: "" };

export default function AboutEditor({
  data,
  onChange,
}: {
  data: AboutContent;
  onChange: (v: AboutContent) => void;
}) {
  const paragraphs = data.paragraphs ?? [];
  const cards = data.cards ?? [];

  return (
    <>
      <div className="admin-section-card">
        <h2>About</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />

        {paragraphs.map((p, i) => (
          <div key={i}>
            <TextField
              label={`Paragraph ${i + 1}`}
              value={p}
              multiline
              onChange={(v) => onChange({ ...data, paragraphs: replaceAt(paragraphs, i, v) })}
            />
            {paragraphs.length > 1 && (
              <button
                type="button"
                className="admin-link"
                style={{ marginBottom: 16 }}
                onClick={() => onChange({ ...data, paragraphs: removeAt(paragraphs, i) })}
              >
                Remove paragraph
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="admin-btn ghost"
          onClick={() => onChange({ ...data, paragraphs: [...paragraphs, ""] })}
        >
          + Add Paragraph
        </button>
      </div>

      <AddButton
        label="Add Card"
        onClick={() => onChange({ ...data, cards: [...cards, { ...EMPTY_CARD }] })}
      />
      {cards.map((card, i) => (
        <ListCard
          key={i}
          title={`Card ${i + 1}`}
          index={i}
          total={cards.length}
          onRemove={() => onChange({ ...data, cards: removeAt(cards, i) })}
          onMove={(to) => onChange({ ...data, cards: moveItem(cards, i, to) })}
        >
          <TextField
            label="Number"
            value={card.number}
            onChange={(v) => onChange({ ...data, cards: replaceAt(cards, i, { ...card, number: v }) })}
          />
          <TextField
            label="Title"
            value={card.title}
            onChange={(v) => onChange({ ...data, cards: replaceAt(cards, i, { ...card, title: v }) })}
          />
          <TextField
            label="Description"
            value={card.description}
            multiline
            onChange={(v) => onChange({ ...data, cards: replaceAt(cards, i, { ...card, description: v }) })}
          />
        </ListCard>
      ))}
    </>
  );
}
