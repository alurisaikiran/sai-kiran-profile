"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface StoredResume {
  id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ResumeUpload({ resume }: { resume: StoredResume | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/resume", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm("Remove the stored resume? It will no longer be attachable to emails.")) return;
    setBusy(true);
    await fetch("/api/admin/resume", { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="admin-section-card">
      <h2>Resume</h2>

      {error && <div className="admin-notice error">{error}</div>}

      <p className="admin-muted-text" style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Stored privately and only read when you choose to attach it to an email. PDF or Word,
        up to 3MB.
      </p>

      {resume ? (
        <>
          <p style={{ marginBottom: 8 }}>
            <strong>{resume.filename}</strong>{" "}
            <span className="admin-muted-text">
              · {formatSize(resume.size_bytes)} · uploaded{" "}
              {new Date(resume.created_at).toLocaleDateString()}
            </span>
          </p>
          <div className="admin-row" style={{ margin: 0 }}>
            <label className="admin-btn ghost admin-upload-btn">
              {busy ? "Working…" : "Replace"}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                hidden
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button className="admin-btn ghost" onClick={remove} disabled={busy}>
              Remove
            </button>
          </div>
        </>
      ) : (
        <label className="admin-btn primary admin-upload-btn">
          {busy ? "Uploading…" : "Upload Resume"}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
