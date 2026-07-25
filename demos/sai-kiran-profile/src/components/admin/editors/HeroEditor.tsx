"use client";

import { TextField, TagField, ImageField } from "@/components/admin/fields";
import type { HeroContent } from "@/lib/content-types";

export default function HeroEditor({
  data,
  onChange,
}: {
  data: HeroContent;
  onChange: (v: HeroContent) => void;
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
        multiline
        onChange={(description) => onChange({ ...data, description })}
      />
      <TagField label="Rotating roles" tags={data.roles} onChange={(roles) => onChange({ ...data, roles })} />
    </div>
  );
}
