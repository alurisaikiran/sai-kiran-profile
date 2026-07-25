/** Date-range presets and Gmail search-query construction, shared by the
 *  inbox list and contact extraction. */

export interface RangePreset {
  key: string;
  label: string;
  days: number | null; // null = no date bound
}

export const RANGE_PRESETS: RangePreset[] = [
  { key: "1d", label: "24 hours", days: 1 },
  { key: "3d", label: "3 days", days: 3 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "15d", label: "15 days", days: 15 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "60d", label: "60 days", days: 60 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "365d", label: "1 year", days: 365 },
  { key: "all", label: "All time", days: null },
];

export const DEFAULT_RANGE = "30d";

export interface DateRange {
  preset: string;
  /** YYYY-MM-DD, only used when preset is "custom". */
  from?: string;
  to?: string;
}

/** Gmail wants YYYY/MM/DD in after:/before: operators. */
function toGmailDate(iso: string): string {
  return iso.replace(/-/g, "/");
}

/**
 * Builds the Gmail `q` parameter for a range. Returns undefined for "all
 * time", which means no date filter at all.
 */
export function buildDateQuery(range: DateRange): string | undefined {
  if (range.preset === "custom") {
    const parts: string[] = [];
    if (range.from) parts.push(`after:${toGmailDate(range.from)}`);
    // Gmail's before: is exclusive of the named day, so push it out by one to
    // make the picker's end date inclusive, which is what people expect.
    if (range.to) {
      const end = new Date(`${range.to}T00:00:00Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      parts.push(`before:${toGmailDate(end.toISOString().slice(0, 10))}`);
    }
    return parts.length > 0 ? parts.join(" ") : undefined;
  }

  const preset = RANGE_PRESETS.find((p) => p.key === range.preset);
  return preset?.days ? `newer_than:${preset.days}d` : undefined;
}

/** Human-readable description of the window a range covers. */
export function describeRange(range: DateRange): string {
  if (range.preset === "custom") {
    if (range.from && range.to) return `${formatDay(range.from)} – ${formatDay(range.to)}`;
    if (range.from) return `since ${formatDay(range.from)}`;
    if (range.to) return `up to ${formatDay(range.to)}`;
    return "all time";
  }

  const preset = RANGE_PRESETS.find((p) => p.key === range.preset);
  if (!preset || preset.days === null) return "all time";

  const start = new Date();
  start.setDate(start.getDate() - preset.days);
  return `${formatDay(start.toISOString().slice(0, 10))} – today`;
}

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "just now" / "3m ago" / "2h ago" — for showing when data was last pulled. */
export function relativeTime(from: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - from.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
