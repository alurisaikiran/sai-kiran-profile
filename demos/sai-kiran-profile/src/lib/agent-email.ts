import type { AgentNewsItem } from "./agent-feed";

const CATEGORY_META: Record<
  AgentNewsItem["category"],
  { accent: string; badgeBg: string; badgeColor: string; emoji: string }
> = {
  "AI & ML": {
    accent: "#10c8d2",
    badgeBg: "#e0f7fa",
    badgeColor: "#0e7490",
    emoji: "🤖",
  },
  "Visa & Immigration": {
    accent: "#f97316",
    badgeBg: "#fff7ed",
    badgeColor: "#c2410c",
    emoji: "🛂",
  },
  "Stocks & Finance": {
    accent: "#22c55e",
    badgeBg: "#f0fdf4",
    badgeColor: "#15803d",
    emoji: "📈",
  },
  Tech: {
    accent: "#a855f7",
    badgeBg: "#faf5ff",
    badgeColor: "#7e22ce",
    emoji: "💻",
  },
};

function importanceBadge(n: number): { bg: string; color: string; border: string } {
  if (n >= 75) return { bg: "#dcfce7", color: "#15803d", border: "#86efac" };
  if (n >= 50) return { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
  if (n >= 25) return { bg: "#fef9c3", color: "#a16207", border: "#fde047" };
  return { bg: "#fee2e2", color: "#b91c1c", border: "#fca5a5" };
}

function relTime(iso: string | null): string {
  if (!iso) return "";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function itemRow(item: AgentNewsItem): string {
  const cat = CATEGORY_META[item.category];
  const badge = importanceBadge(item.importance);

  return `
  <tr>
    <td style="padding:0 0 14px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${cat.accent};border-radius:0 8px 8px 0;padding:16px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:${badge.bg};color:${badge.color};border:1px solid ${badge.border};font-size:11px;font-weight:700;padding:2px 9px;border-radius:999px;margin-right:8px;">${item.importance}%</span>
                  <span style="color:#94a3b8;font-size:11px;">${item.source}${item.publishedAt ? " &middot; " + relTime(item.publishedAt) : ""}</span>
                </td>
              </tr>
              <tr>
                <td style="padding-top:8px;padding-bottom:${item.summary || item.explanation ? "10px" : "0"};">
                  <div style="color:#0f172a;font-size:15px;font-weight:700;line-height:1.4;">${item.title}</div>
                </td>
              </tr>
              ${
                item.summary
                  ? `<tr><td style="padding:10px 14px;background:#ffffff;border-radius:6px;">
                       <div style="color:#334155;font-size:14px;line-height:1.65;">${item.summary}</div>
                     </td></tr><tr><td style="height:8px;line-height:8px;">&nbsp;</td></tr>`
                  : ""
              }
              ${
                item.takeaways && item.takeaways.length > 0
                  ? `<tr><td style="padding:10px 14px;background:#f1f5f9;border-radius:6px;">
                       <div style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;margin-bottom:8px;">Key points</div>
                       ${item.takeaways
                         .map(
                           (t) =>
                             `<div style="display:flex;gap:8px;margin-bottom:6px;color:#334155;font-size:13px;line-height:1.5;"><span style="color:${cat.accent};font-weight:800;">▸</span><span>${t}</span></div>`
                         )
                         .join("")}
                     </td></tr><tr><td style="height:8px;line-height:8px;">&nbsp;</td></tr>`
                  : ""
              }
              ${
                item.explanation
                  ? `<tr><td style="padding:12px 14px;background:${cat.badgeBg};border-radius:6px;border-left:3px solid ${cat.accent};">
                       <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;color:${cat.accent};text-transform:uppercase;margin-bottom:6px;">What this means for you</div>
                       <div style="color:#334155;font-size:13px;line-height:1.6;">${item.explanation}</div>
                     </td></tr>`
                  : item.reason
                  ? `<tr><td style="padding-top:6px;color:#64748b;font-size:12px;line-height:1.5;font-style:italic;">${item.reason}</td></tr>`
                  : ""
              }
              <tr>
                <td style="padding-top:10px;">
                  <a href="${item.url}" style="color:${cat.accent};font-size:11px;font-weight:700;text-decoration:none;">Read the original &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function categorySection(
  cat: AgentNewsItem["category"],
  items: AgentNewsItem[]
): string {
  if (items.length === 0) return "";
  const meta = CATEGORY_META[cat];
  const top = items.slice(0, 5);

  return `
  <tr>
    <td style="padding:0 0 22px 0;">
      <!-- Category header -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
        <tr>
          <td style="border-bottom:2px solid ${meta.accent};padding-bottom:8px;">
            <span style="font-size:11px;font-weight:700;color:#334155;letter-spacing:0.08em;text-transform:uppercase;">${meta.emoji} ${cat}</span>
            <span style="color:#94a3b8;font-size:11px;margin-left:8px;">${items.length} article${items.length !== 1 ? "s" : ""}</span>
          </td>
        </tr>
      </table>
      <!-- Items -->
      <table width="100%" cellpadding="0" cellspacing="0">
        ${top.map(itemRow).join("")}
      </table>
    </td>
  </tr>`;
}

export function buildDigestEmail(
  items: AgentNewsItem[],
  fetchedAt: string
): { subject: string; html: string; text: string } {
  const date = new Date(fetchedAt);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  const categories: AgentNewsItem["category"][] = [
    "AI & ML",
    "Visa & Immigration",
    "Stocks & Finance",
    "Tech",
  ];

  const grouped = new Map<AgentNewsItem["category"], AgentNewsItem[]>();
  for (const cat of categories) {
    grouped.set(
      cat,
      items.filter((i) => i.category === cat)
    );
  }

  const adminUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>SK Daily Brief — ${dateStr}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ── Header ── -->
    <tr>
      <td style="background:linear-gradient(135deg,#0d1117 0%,#161b22 100%);border-radius:12px 12px 0 0;padding:32px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="color:#10c8d2;font-size:10px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:10px;">SK Daily Brief</div>
              <div style="color:#ffffff;font-size:26px;font-weight:800;line-height:1.25;margin-bottom:8px;">Your Intelligence Update</div>
              <div style="color:#8b949e;font-size:13px;line-height:1.6;">${dateStr} &nbsp;&middot;&nbsp; <strong style="color:#e6edf3;">${items.length}</strong> articles ranked by AI</div>
            </td>
            <td align="right" style="vertical-align:top;">
              <div style="background:rgba(16,200,210,0.12);border:1px solid rgba(16,200,210,0.3);border-radius:8px;padding:10px 14px;text-align:center;">
                <div style="color:#10c8d2;font-size:22px;font-weight:800;">${items.filter(i => i.importance >= 75).length}</div>
                <div style="color:#8b949e;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">High Priority</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── Quick stats bar ── -->
    <tr>
      <td style="background:#1e293b;padding:14px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${categories
              .map((cat) => {
                const meta = CATEGORY_META[cat];
                const count = (grouped.get(cat) ?? []).length;
                return `<td style="text-align:center;padding:0 6px;border-right:1px solid rgba(255,255,255,0.08);">
                  <div style="color:${meta.accent};font-size:16px;font-weight:800;">${count}</div>
                  <div style="color:#8b949e;font-size:9px;text-transform:uppercase;letter-spacing:0.06em;margin-top:2px;">${cat.replace(" & ", "&nbsp;&amp;&nbsp;")}</div>
                </td>`;
              })
              .join("")}
          </tr>
        </table>
      </td>
    </tr>

    <!-- ── Body ── -->
    <tr>
      <td style="background:#ffffff;padding:28px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${categories.map((cat) => categorySection(cat, grouped.get(cat) ?? [])).join("")}
        </table>
      </td>
    </tr>

    <!-- ── Footer ── -->
    <tr>
      <td style="background:#f8fafc;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;padding:20px 36px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#94a3b8;font-size:12px;line-height:1.7;text-align:center;">
              Sent every day at 8:00 AM EST by your personal Agent<br>
              <a href="${adminUrl}/admin/agent" style="color:#10c8d2;text-decoration:none;">View full dashboard</a>
              &nbsp;&middot;&nbsp;
              <a href="${adminUrl}/admin" style="color:#94a3b8;text-decoration:none;">Admin</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  </td></tr>
</table>

</body>
</html>`;

  // Plain-text fallback
  const text = [
    `SK DAILY BRIEF — ${dateStr}`,
    `${items.length} articles ranked by AI`,
    "",
    ...categories.flatMap((cat) => {
      const catItems = (grouped.get(cat) ?? []).slice(0, 5);
      if (!catItems.length) return [];
      return [
        `── ${cat.toUpperCase()} ──`,
        ...catItems.flatMap((i) => [
          `[${i.importance}%] ${i.title}`,
          i.summary ? `  Story: ${i.summary}` : "",
          ...(i.takeaways && i.takeaways.length > 0
            ? ["  Key points:", ...i.takeaways.map((t) => `    • ${t}`)]
            : []),
          i.explanation ? `  For you: ${i.explanation}` : "",
          `  Source: ${i.url}`,
          "",
        ].filter(Boolean)),
        "",
      ];
    }),
    `View in dashboard: ${adminUrl}/admin/agent`,
  ].join("\n");

  const subject = `Daily Brief: ${items.filter((i) => i.importance >= 75).length} high-priority updates — ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return { subject, html, text };
}
