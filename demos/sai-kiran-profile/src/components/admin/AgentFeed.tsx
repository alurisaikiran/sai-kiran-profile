"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgentNewsItem } from "@/lib/agent-feed";

type Category = AgentNewsItem["category"];
type Filter = Category | "All";

const CATEGORY_META: Record<Category, { emoji: string; color: string; short: string }> = {
  "AI & ML":            { emoji: "🤖", color: "#10c8d2", short: "AI & ML" },
  "Visa & Immigration": { emoji: "🛂", color: "#f97316", short: "Visa" },
  "Stocks & Finance":   { emoji: "📈", color: "#22c55e", short: "Stocks" },
  Tech:                 { emoji: "💻", color: "#a855f7", short: "Tech" },
};

const FILTERS: Filter[] = ["All", "AI & ML", "Visa & Immigration", "Stocks & Finance", "Tech"];

function relTime(iso: string | null): string {
  if (!iso) return "";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

interface FeedMeta {
  fetchedAt: string;
  sources: { hn: number; devTo: number; visa: number };
}

/* ─────────── Sub-components ─────────── */

function ProgressBar({
  value,
  color,
  delay = 0,
  height = 4,
}: {
  value: number;
  color: string;
  delay?: number;
  height?: number;
}) {
  return (
    <div className="agent-bar" style={{ height }}>
      <div
        className="agent-bar-fill"
        style={
          {
            "--fill": `${Math.min(100, Math.max(0, value))}%`,
            "--fill-color": color,
            animationDelay: `${delay}ms`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function StoryCard({
  item,
  delay = 0,
  hero = false,
}: {
  item: AgentNewsItem;
  delay?: number;
  hero?: boolean;
}) {
  const meta = CATEGORY_META[item.category];
  return (
    <article
      className={`story${hero ? " story-hero" : ""}`}
      style={
        {
          "--cat-color": meta.color,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {hero && <div className="story-glow" />}

      <header className="story-head">
        <span className="story-cat">
          <span className="story-emoji">{meta.emoji}</span>
          {item.category}
        </span>
        {hero && <span className="story-rank">TOP STORY TODAY</span>}
      </header>

      <div className="story-score">
        <ProgressBar
          value={item.importance}
          color={meta.color}
          height={hero ? 6 : 5}
          delay={delay + 150}
        />
        <span className="story-percent">{item.importance}%</span>
      </div>

      <h2 className="story-title">{item.title}</h2>

      {item.summary && (
        <div className="story-summary">
          <p>{item.summary}</p>
        </div>
      )}

      {item.takeaways && item.takeaways.length > 0 && (
        <div className="story-takeaways">
          <div className="story-block-label">Key points</div>
          <ul>
            {item.takeaways.map((t, i) => (
              <li key={i}>
                <span className="story-bullet-dot">▸</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.explanation && (
        <div className="story-explain">
          <div className="story-block-label">What this means for you</div>
          <p>{item.explanation}</p>
        </div>
      )}

      <footer className="story-foot">
        <span className="story-source">
          {item.source}
          {item.publishedAt && <span className="story-dot">·</span>}
          {item.publishedAt && relTime(item.publishedAt)}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="story-source-link"
        >
          Read original ↗
        </a>
      </footer>
    </article>
  );
}

/* ─────────── Main component ─────────── */

export default function AgentFeed() {
  const [items, setItems] = useState<AgentNewsItem[]>([]);
  const [meta, setMeta] = useState<FeedMeta | null>(null);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  const loadCache = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/agent/feed");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load feed");
      if (data.fetchedAt) {
        setItems(data.items ?? []);
        setMeta({ fetchedAt: data.fetchedAt, sources: data.sources });
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load feed");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCache(); }, [loadCache]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/agent/feed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      setItems(data.items ?? []);
      setMeta({ fetchedAt: data.fetchedAt, sources: data.sources });
      setEmpty(false);
      setNotice("Feed refreshed with fresh article content.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    }
    setRefreshing(false);
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.importance - a.importance),
    [items]
  );

  const hero = sorted[0] ?? null;
  const rest = sorted.slice(1);
  const filtered = filter === "All" ? rest : rest.filter((i) => i.category === filter);

  const countFor = (cat: Category) => sorted.filter((i) => i.category === cat).length;
  const highPriority = sorted.filter((i) => i.importance >= 75).length;

  return (
    <div className="agent-reader">
      {/* ── Header ── */}
      <div className="agent-topbar">
        <div>
          <div className="agent-topbar-title">
            News Agent
            {meta && (
              <span className="agent-topbar-badge">
                <span className="agent-live-dot" />
                Auto-updated
              </span>
            )}
          </div>
          <div className="agent-topbar-sub">
            {meta ? (
              <>
                <strong>{sorted.length}</strong> articles ·{" "}
                <strong style={{ color: "#22c55e" }}>{highPriority}</strong> high-priority ·
                summarized from real content by AI
              </>
            ) : (
              "Ranked daily · Email sent to your inbox at 8:00 AM EST"
            )}
          </div>
        </div>

        <div className="agent-topbar-actions">
          {meta && (
            <span className="agent-topbar-time" title={fmtTime(meta.fetchedAt)}>
              As of {relTime(meta.fetchedAt)}
            </span>
          )}
          <button
            className="admin-btn ghost"
            onClick={refresh}
            disabled={refreshing || loading}
          >
            {refreshing ? "Reading articles…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="admin-notice error">{error}</div>}
      {notice && <div className="admin-notice success">{notice}</div>}

      {loading && (
        <>
          <div className="story story-hero agent-skeleton" style={{ height: 460 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="story agent-skeleton" style={{ height: 340, marginTop: 16 }} />
          ))}
        </>
      )}

      {!loading && empty && (
        <div className="admin-empty" style={{ padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
          <div style={{ marginBottom: 12 }}>No feed cached yet.</div>
          <div style={{ fontSize: 12, marginBottom: 20 }}>
            The cron runs every day at 8:00 AM EST. You can also fetch it now — it will read every article.
          </div>
          <button className="admin-btn primary" onClick={refresh} disabled={refreshing}>
            {refreshing ? "Reading articles…" : "Fetch news now"}
          </button>
        </div>
      )}

      {!loading && meta && hero && (
        <>
          <StoryCard item={hero} hero delay={0} />

          <div className="agent-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`agent-filter-chip${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "All" ? "All stories" : (
                  <>
                    <span>{CATEGORY_META[f as Category].emoji}</span>
                    {CATEGORY_META[f as Category].short}
                  </>
                )}
                <span className="agent-filter-count">
                  {f === "All" ? sorted.length - 1 : countFor(f as Category)}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="admin-empty">No stories in this category today.</div>
          ) : (
            <div className="agent-feed-list">
              {filtered.map((item, i) => (
                <StoryCard key={item.id} item={item} delay={i * 60} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
