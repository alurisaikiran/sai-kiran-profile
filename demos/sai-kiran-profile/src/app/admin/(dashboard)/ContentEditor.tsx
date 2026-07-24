"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TagField, ImageField } from "@/components/admin/fields";
import {
  EMPTY_CREDENTIAL_ITEM,
  EMPTY_EXPERIENCE_ITEM,
  type SiteContent,
} from "@/lib/content-types";

const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "credentials", label: "Credentials" },
  { key: "contact", label: "Contact" },
] as const;

type EditableSection = (typeof SECTIONS)[number]["key"];

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [active, setActive] = useState<EditableSection>("hero");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  /** Replaces the active section's data in local state. */
  function patch<K extends EditableSection>(key: K, value: SiteContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/content/${active}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content[active]),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `${res.status} ${res.statusText}`);
      }
      flash("success", "Saved successfully.");
      router.refresh();
    } catch (err) {
      flash("error", `Save failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
    setSaving(false);
  }

  return (
    <>
      <div className="admin-topbar">
        <h1>Site Content</h1>
        <button className="admin-btn primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="admin-content">
        {notice && <div className={`admin-notice ${notice.kind}`}>{notice.msg}</div>}

        <div className="admin-subnav">
          {SECTIONS.map(({ key, label }) => (
            <button
              key={key}
              className={`admin-chip${key === active ? " active" : ""}`}
              onClick={() => setActive(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {active === "hero" && <HeroEditor data={content.hero} onChange={(v) => patch("hero", v)} />}
        {active === "about" && <AboutEditor data={content.about} onChange={(v) => patch("about", v)} />}
        {active === "skills" && <SkillsEditor data={content.skills} onChange={(v) => patch("skills", v)} />}
        {active === "experience" && (
          <ExperienceEditor data={content.experience} onChange={(v) => patch("experience", v)} />
        )}
        {active === "credentials" && (
          <CredentialsEditor data={content.credentials} onChange={(v) => patch("credentials", v)} />
        )}
        {active === "contact" && <ContactEditor data={content.contact} onChange={(v) => patch("contact", v)} />}
      </div>
    </>
  );
}

/* ── Section editors ── */

function HeroEditor({
  data,
  onChange,
}: {
  data: SiteContent["hero"];
  onChange: (v: SiteContent["hero"]) => void;
}) {
  return (
    <div className="admin-section-card">
      <h2>Hero</h2>
      <ImageField label="Photo" value={data.photo} onChange={(photo) => onChange({ ...data, photo })} />
      <TextField label="Name" value={data.name} onChange={(name) => onChange({ ...data, name })} />
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
      <TextField
        label="Description"
        value={data.description}
        onChange={(description) => onChange({ ...data, description })}
        multiline
      />
      <TagField label="Roles" tags={data.roles} onChange={(roles) => onChange({ ...data, roles })} />
    </div>
  );
}

function AboutEditor({
  data,
  onChange,
}: {
  data: SiteContent["about"];
  onChange: (v: SiteContent["about"]) => void;
}) {
  return (
    <>
      <div className="admin-section-card">
        <h2>About</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
        {data.paragraphs.map((p, i) => (
          <TextField
            key={i}
            label={`Paragraph ${i + 1}`}
            value={p}
            multiline
            onChange={(v) => {
              const paragraphs = [...data.paragraphs];
              paragraphs[i] = v;
              onChange({ ...data, paragraphs });
            }}
          />
        ))}
      </div>
      {data.cards.map((card, i) => (
        <div className="admin-section-card" key={i}>
          <h2>Card {i + 1}</h2>
          <TextField
            label="Number"
            value={card.number}
            onChange={(v) => onChange({ ...data, cards: replaceAt(data.cards, i, { ...card, number: v }) })}
          />
          <TextField
            label="Title"
            value={card.title}
            onChange={(v) => onChange({ ...data, cards: replaceAt(data.cards, i, { ...card, title: v }) })}
          />
          <TextField
            label="Description"
            value={card.description}
            multiline
            onChange={(v) => onChange({ ...data, cards: replaceAt(data.cards, i, { ...card, description: v }) })}
          />
        </div>
      ))}
    </>
  );
}

function SkillsEditor({
  data,
  onChange,
}: {
  data: SiteContent["skills"];
  onChange: (v: SiteContent["skills"]) => void;
}) {
  return (
    <>
      <div className="admin-section-card">
        <h2>Skills</h2>
        <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
        <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      </div>
      {data.categories.map((cat, i) => (
        <div className="admin-section-card" key={i}>
          <h2>{cat.title}</h2>
          <TextField
            label="Title"
            value={cat.title}
            onChange={(v) =>
              onChange({ ...data, categories: replaceAt(data.categories, i, { ...cat, title: v }) })
            }
          />
          <TagField
            label="Skills"
            tags={cat.items}
            onChange={(items) =>
              onChange({ ...data, categories: replaceAt(data.categories, i, { ...cat, items }) })
            }
          />
        </div>
      ))}
    </>
  );
}

function ExperienceEditor({
  data,
  onChange,
}: {
  data: SiteContent["experience"];
  onChange: (v: SiteContent["experience"]) => void;
}) {
  return (
    <div>
      <div className="admin-list-actions">
        <button
          type="button"
          className="admin-btn primary"
          onClick={() => onChange({ ...data, items: [...data.items, { ...EMPTY_EXPERIENCE_ITEM }] })}
        >
          + Add Role
        </button>
      </div>
      {data.items.map((item, i) => (
        <div className="admin-section-card" key={i}>
          <div className="admin-section-card-head">
            <h2>Role {i + 1}</h2>
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() => onChange({ ...data, items: removeAt(data.items, i) })}
            >
              Remove
            </button>
          </div>
          <TextField
            label="Date"
            value={item.date}
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, date: v }) })}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, title: v }) })}
          />
          <TextField
            label="Description"
            value={item.description}
            multiline
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, description: v }) })}
          />
          <TagField
            label="Tags"
            tags={item.tags}
            onChange={(tags) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, tags }) })}
          />
        </div>
      ))}
    </div>
  );
}

function CredentialsEditor({
  data,
  onChange,
}: {
  data: SiteContent["credentials"];
  onChange: (v: SiteContent["credentials"]) => void;
}) {
  return (
    <div>
      <div className="admin-list-actions">
        <button
          type="button"
          className="admin-btn primary"
          onClick={() => onChange({ ...data, items: [...data.items, { ...EMPTY_CREDENTIAL_ITEM }] })}
        >
          + Add Credential
        </button>
      </div>
      {data.items.map((item, i) => (
        <div className="admin-section-card" key={i}>
          <div className="admin-section-card-head">
            <h2>Credential {i + 1}</h2>
            <button
              type="button"
              className="admin-btn ghost"
              onClick={() => onChange({ ...data, items: removeAt(data.items, i) })}
            >
              Remove
            </button>
          </div>
          <TextField
            label="Badge"
            value={item.badge}
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, badge: v }) })}
          />
          <TextField
            label="Title"
            value={item.title}
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, title: v }) })}
          />
          <TextField
            label="Subtitle"
            value={item.subtitle}
            onChange={(v) => onChange({ ...data, items: replaceAt(data.items, i, { ...item, subtitle: v }) })}
          />
        </div>
      ))}
    </div>
  );
}

function ContactEditor({
  data,
  onChange,
}: {
  data: SiteContent["contact"];
  onChange: (v: SiteContent["contact"]) => void;
}) {
  return (
    <div className="admin-section-card">
      <h2>Contact</h2>
      <TextField label="Eyebrow" value={data.eyebrow} onChange={(eyebrow) => onChange({ ...data, eyebrow })} />
      <TextField label="Heading" value={data.heading} onChange={(heading) => onChange({ ...data, heading })} />
      <TextField
        label="Description"
        value={data.description}
        multiline
        onChange={(description) => onChange({ ...data, description })}
      />
      <TextField label="Email" value={data.email} onChange={(email) => onChange({ ...data, email })} />
      <TextField label="Phone" value={data.phone} onChange={(phone) => onChange({ ...data, phone })} />
    </div>
  );
}

/* ── Array helpers ── */

function replaceAt<T>(arr: T[], index: number, value: T): T[] {
  const next = [...arr];
  next[index] = value;
  return next;
}

function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index);
}
