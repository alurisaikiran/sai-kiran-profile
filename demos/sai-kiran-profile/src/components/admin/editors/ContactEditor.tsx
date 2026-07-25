"use client";

import { TextField } from "@/components/admin/fields";
import type { ContactContent } from "@/lib/content-types";

export default function ContactEditor({
  data,
  onChange,
}: {
  data: ContactContent;
  onChange: (v: ContactContent) => void;
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
      <TextField
        label="Phone button label"
        value={data.phoneLabel}
        onChange={(phoneLabel) => onChange({ ...data, phoneLabel })}
      />
    </div>
  );
}
