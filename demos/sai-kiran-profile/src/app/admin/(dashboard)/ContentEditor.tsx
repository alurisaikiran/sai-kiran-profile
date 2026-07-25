"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SectionKey, SiteContent } from "@/lib/content-types";

import HeroEditor from "@/components/admin/editors/HeroEditor";
import StatsEditor from "@/components/admin/editors/StatsEditor";
import AboutEditor from "@/components/admin/editors/AboutEditor";
import SkillsEditor from "@/components/admin/editors/SkillsEditor";
import ProjectsEditor from "@/components/admin/editors/ProjectsEditor";
import LaunchedEditor from "@/components/admin/editors/LaunchedEditor";
import ExperienceEditor from "@/components/admin/editors/ExperienceEditor";
import CredentialsEditor from "@/components/admin/editors/CredentialsEditor";
import ContactEditor from "@/components/admin/editors/ContactEditor";

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "hero", label: "Hero" },
  { key: "stats", label: "Stats" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "launched", label: "Launched" },
  { key: "experience", label: "Experience" },
  { key: "credentials", label: "Credentials" },
  { key: "contact", label: "Contact" },
];

export default function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [active, setActive] = useState<SectionKey>("hero");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  // After a save we call router.refresh(), which re-renders the server
  // component and hands us fresh props. useState ignores prop changes after
  // mount, so sync explicitly — but never over unsaved edits.
  const lastServerContent = useRef(initialContent);
  useEffect(() => {
    if (initialContent !== lastServerContent.current) {
      lastServerContent.current = initialContent;
      if (!dirty) setContent(initialContent);
    }
  }, [initialContent, dirty]);

  // Don't let a stray refresh or tab close silently drop pending edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function flash(kind: "success" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  function patch<K extends SectionKey>(key: K, value: SiteContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty(true);
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
      setDirty(false);
      flash("success", `${SECTIONS.find((s) => s.key === active)?.label} saved.`);
      router.refresh();
    } catch (err) {
      flash("error", `Save failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
    setSaving(false);
  }

  const section = content[active];

  return (
    <>
      <div className="admin-topbar">
        <h1>
          Site Content
          {dirty && <span className="admin-dirty-dot" title="Unsaved changes" />}
        </h1>
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

        {!section ? (
          <div className="admin-empty">
            This section has no content yet. Run <code>npm run seed</code> to load your starting
            content into Supabase, then reload.
          </div>
        ) : (
          <>
            {active === "hero" && <HeroEditor data={content.hero} onChange={(v) => patch("hero", v)} />}
            {active === "stats" && <StatsEditor data={content.stats} onChange={(v) => patch("stats", v)} />}
            {active === "about" && <AboutEditor data={content.about} onChange={(v) => patch("about", v)} />}
            {active === "skills" && <SkillsEditor data={content.skills} onChange={(v) => patch("skills", v)} />}
            {active === "projects" && (
              <ProjectsEditor data={content.projects} onChange={(v) => patch("projects", v)} />
            )}
            {active === "launched" && (
              <LaunchedEditor data={content.launched} onChange={(v) => patch("launched", v)} />
            )}
            {active === "experience" && (
              <ExperienceEditor data={content.experience} onChange={(v) => patch("experience", v)} />
            )}
            {active === "credentials" && (
              <CredentialsEditor data={content.credentials} onChange={(v) => patch("credentials", v)} />
            )}
            {active === "contact" && (
              <ContactEditor data={content.contact} onChange={(v) => patch("contact", v)} />
            )}
          </>
        )}
      </div>
    </>
  );
}
