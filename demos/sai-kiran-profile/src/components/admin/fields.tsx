"use client";

import { useState } from "react";

export function TextField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {multiline ? (
        <textarea className="admin-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          className="admin-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function TagField({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || tags.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...tags, v]);
    setDraft("");
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-tag-list">
        {tags.map((t) => (
          <span className="admin-tag" key={t}>
            <span>{t}</span>
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="admin-row">
        <input
          className="admin-input"
          type="text"
          placeholder="Add tag…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button className="admin-btn ghost" type="button" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [status, setStatus] = useState("");

  async function upload(file: File) {
    setStatus("Uploading…");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      setStatus("Uploaded.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
    setTimeout(() => setStatus(""), 3000);
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-image-upload">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="admin-image-preview" src={value} alt="" />
        )}
        <input
          className="admin-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="admin-btn ghost admin-upload-btn">
          Upload
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
        <span className="admin-image-status">{status}</span>
      </div>
    </div>
  );
}
