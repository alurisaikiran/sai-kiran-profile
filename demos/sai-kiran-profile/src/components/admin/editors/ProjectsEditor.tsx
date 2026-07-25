"use client";

import { TextField, TagField, ImageField } from "@/components/admin/fields";
import { AddButton, ListCard } from "./ListCard";
import { moveItem, removeAt, replaceAt } from "./helpers";
import type { ProjectsContent } from "@/lib/content-types";

const EMPTY_CARD = { badge: "", title: "", description: "", tags: [] as string[] };
const EMPTY_DEMO = {
  href: "",
  image: "",
  imageAlt: "",
  badge: "",
  title: "",
  description: "",
  cta: "View demo",
};

export default function ProjectsEditor({
  data,
  onChange,
}: {
  data: ProjectsContent;
  onChange: (v: ProjectsContent) => void;
}) {
  const cards = data.cards ?? [];
  const demos = data.demos?.items ?? [];
  const featured = data.featured;

  return (
    <>
      <div className="admin-section-card">
        <h2>Projects</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      </div>

      {featured && (
        <div className="admin-section-card">
          <h2>Featured project</h2>
          <TextField
            label="Badge"
            value={featured.badge}
            onChange={(v) => onChange({ ...data, featured: { ...featured, badge: v } })}
          />
          <TextField
            label="Title"
            value={featured.title}
            onChange={(v) => onChange({ ...data, featured: { ...featured, title: v } })}
          />
          <TextField
            label="Link"
            value={featured.href}
            onChange={(v) => onChange({ ...data, featured: { ...featured, href: v } })}
          />
          <TextField
            label="Description"
            value={featured.description}
            multiline
            onChange={(v) => onChange({ ...data, featured: { ...featured, description: v } })}
          />
          <TagField
            label="Tags"
            tags={featured.tags ?? []}
            onChange={(tags) => onChange({ ...data, featured: { ...featured, tags } })}
          />

          <h2 style={{ marginTop: 24 }}>Browser mockup</h2>
          <TextField
            label="URL shown in the bar"
            value={featured.browserUrl}
            onChange={(v) => onChange({ ...data, featured: { ...featured, browserUrl: v } })}
          />
          <TextField
            label="Subline"
            value={featured.browserSubline}
            onChange={(v) => onChange({ ...data, featured: { ...featured, browserSubline: v } })}
          />
          <TextField
            label="Headline"
            value={featured.browserHeadline}
            onChange={(v) => onChange({ ...data, featured: { ...featured, browserHeadline: v } })}
          />
          <TagField
            label="Pills"
            tags={featured.browserPills ?? []}
            onChange={(browserPills) => onChange({ ...data, featured: { ...featured, browserPills } })}
          />
        </div>
      )}

      <AddButton
        label="Add Project Card"
        onClick={() => onChange({ ...data, cards: [...cards, { ...EMPTY_CARD }] })}
      />
      {cards.map((card, i) => (
        <ListCard
          key={i}
          title={card.title || `Card ${i + 1}`}
          index={i}
          total={cards.length}
          onRemove={() => onChange({ ...data, cards: removeAt(cards, i) })}
          onMove={(to) => onChange({ ...data, cards: moveItem(cards, i, to) })}
        >
          <TextField
            label="Badge"
            value={card.badge}
            onChange={(v) => onChange({ ...data, cards: replaceAt(cards, i, { ...card, badge: v }) })}
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
          <TagField
            label="Tags"
            tags={card.tags ?? []}
            onChange={(tags) => onChange({ ...data, cards: replaceAt(cards, i, { ...card, tags }) })}
          />
        </ListCard>
      ))}

      {data.demos && (
        <>
          <div className="admin-section-card">
            <h2>Demo gallery</h2>
            <TextField
              label="Eyebrow"
              value={data.demos.eyebrow}
              onChange={(v) => onChange({ ...data, demos: { ...data.demos, eyebrow: v } })}
            />
            <TextField
              label="Heading"
              value={data.demos.heading}
              onChange={(v) => onChange({ ...data, demos: { ...data.demos, heading: v } })}
            />
          </div>

          <AddButton
            label="Add Demo"
            onClick={() =>
              onChange({ ...data, demos: { ...data.demos, items: [...demos, { ...EMPTY_DEMO }] } })
            }
          />
          {demos.map((demo, i) => (
            <ListCard
              key={i}
              title={demo.title || `Demo ${i + 1}`}
              index={i}
              total={demos.length}
              onRemove={() => onChange({ ...data, demos: { ...data.demos, items: removeAt(demos, i) } })}
              onMove={(to) =>
                onChange({ ...data, demos: { ...data.demos, items: moveItem(demos, i, to) } })
              }
            >
              <TextField
                label="Title"
                value={demo.title}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, title: v }) } })
                }
              />
              <TextField
                label="Badge"
                value={demo.badge}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, badge: v }) } })
                }
              />
              <TextField
                label="Link"
                value={demo.href}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, href: v }) } })
                }
              />
              <ImageField
                label="Preview image"
                value={demo.image}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, image: v }) } })
                }
              />
              <TextField
                label="Image alt text"
                value={demo.imageAlt}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, imageAlt: v }) } })
                }
              />
              <TextField
                label="Description"
                value={demo.description}
                multiline
                onChange={(v) =>
                  onChange({
                    ...data,
                    demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, description: v }) },
                  })
                }
              />
              <TextField
                label="Call to action"
                value={demo.cta}
                onChange={(v) =>
                  onChange({ ...data, demos: { ...data.demos, items: replaceAt(demos, i, { ...demo, cta: v }) } })
                }
              />
            </ListCard>
          ))}
        </>
      )}
    </>
  );
}
