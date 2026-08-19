/**
 * Core feed-building logic shared by the manual-refresh API route and the
 * Vercel Cron job. Fetches from three free public sources in parallel, then
 * asks Groq to score and rank every item against Sai Kiran's profile.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface AgentNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  importance: number;
  category: "AI & ML" | "Tech" | "Visa & Immigration" | "Stocks & Finance";
  reason: string;             // 8–12 word tagline
  summary: string;            // 3–4 sentence summary of the actual article
  takeaways: string[];        // 2–3 concrete bullet points from the article
  explanation: string;        // 2 sentences on what it means for Sai Kiran
}

export interface FeedResult {
  items: AgentNewsItem[];
  fetchedAt: string;
  sources: { hn: number; devTo: number; visa: number };
}

interface RawItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
}

async function fetchHackerNews(): Promise<RawItem[]> {
  const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!idsRes.ok) return [];

  const ids: number[] = await idsRes.json();
  const results = await Promise.allSettled(
    ids.slice(0, 18).map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        signal: AbortSignal.timeout(4000),
        cache: "no-store",
      }).then((r) => r.json())
    )
  );

  return results
    .filter(
      (
        r
      ): r is PromiseFulfilledResult<{
        id: number;
        title: string;
        url?: string;
        time?: number;
      }> => r.status === "fulfilled" && Boolean(r.value?.title)
    )
    .map((r) => ({
      id: `hn-${r.value.id}`,
      title: r.value.title,
      url: r.value.url ?? `https://news.ycombinator.com/item?id=${r.value.id}`,
      source: "Hacker News",
      publishedAt: r.value.time ? new Date(r.value.time * 1000).toISOString() : null,
    }));
}

async function fetchDevTo(): Promise<RawItem[]> {
  const [aiRes, devRes] = await Promise.allSettled([
    fetch("https://dev.to/api/articles?tag=artificial-intelligence&per_page=5", {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    }).then((r) => r.json()),
    fetch("https://dev.to/api/articles?tag=programming&per_page=4", {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    }).then((r) => r.json()),
  ]);

  const combined = [
    ...(aiRes.status === "fulfilled" && Array.isArray(aiRes.value) ? aiRes.value : []),
    ...(devRes.status === "fulfilled" && Array.isArray(devRes.value) ? devRes.value : []),
  ];

  return combined
    .filter((a: { id?: unknown; title?: unknown; url?: unknown }) => a?.id && a?.title && a?.url)
    .map((a: { id: number; title: string; url: string; published_at?: string }) => ({
      id: `devto-${a.id}`,
      title: a.title,
      url: a.url,
      source: "Dev.to",
      publishedAt: a.published_at ?? null,
    }));
}

async function fetchVisaNews(): Promise<RawItem[]> {
  try {
    const res = await fetch("https://www.uscis.gov/rss/news", {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; news-agent/1.0)" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return parseRSS(await res.text(), "USCIS").slice(0, 6);
  } catch {
    return [];
  }
}

/**
 * Fetches clean article text via Jina Reader — free, no key required.
 * Falls back to null (title-only summarization) on any failure.
 */
async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "text",
        ...(process.env.JINA_API_KEY
          ? { Authorization: `Bearer ${process.env.JINA_API_KEY}` }
          : {}),
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.length < 100) return null;
    // Trim to keep the Groq prompt manageable — the first 1500 chars almost
    // always contains the lede + first few paragraphs.
    return text.slice(0, 1500).trim();
  } catch {
    return null;
  }
}

/** Runs an async worker over items with a fixed concurrency cap. */
async function withConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

function parseRSS(xml: string, source: string): RawItem[] {
  const items: RawItem[] = [];
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].forEach(([, block], i) => {
    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/i)?.[1]?.trim() ||
      block.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
      "";
    const link =
      block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      block.match(/<guid[^>]*isPermaLink[^>]*>(https?:\/\/[^<]+)<\/guid>/i)?.[1]?.trim() ||
      "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? "";
    if (!title || !link) return;

    let publishedAt: string | null = null;
    try {
      if (pubDate) publishedAt = new Date(pubDate).toISOString();
    } catch {
      /* ignore invalid dates */
    }
    items.push({
      id: `${source.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      title,
      url: link,
      source,
      publishedAt,
    });
  });
  return items;
}

async function rankWithGroq(
  items: RawItem[],
  contents: Map<string, string | null>
): Promise<AgentNewsItem[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || items.length === 0) return fallback(items);

  const system = `You are a personal news analyst for Sai Kiran Aluri, a software developer specializing in AI/ML, full-stack development, and cloud. He is on a US work visa (H-1B/OPT) and tracks these topics in priority order:

1. AI/ML (highest): new models, LLMs, research, AI tools and products
2. US immigration (very high): H-1B, OPT, STEM OPT, Green Card, USCIS policy
3. Tech stocks: NVDA, MSFT, GOOGL, META, AMZN, AAPL — earnings, major moves
4. Software engineering: Next.js, React, TypeScript, cloud (AWS/GCP/Azure), DevOps
5. General tech: layoffs, hiring, funding, product launches relevant to developers

For EACH item, you receive the title, source, and (usually) the actual article content. Study the CONTENT — do not just paraphrase the title. Return:

- id: unchanged
- importance: 0–100 integer (relevance to Sai Kiran specifically)
- category: exactly one of "AI & ML" | "Tech" | "Visa & Immigration" | "Stocks & Finance"
- reason: max 12 words — the one-line hook
- summary: 3 to 4 sentences. Explain what the article actually says: the WHO, WHAT, WHY, and any concrete numbers or names mentioned. Do NOT restate the title. If no content is provided, base it on the title and general knowledge but stay factual.
- takeaways: array of 2 or 3 short bullet points (each 8–14 words). Each bullet must be a concrete fact, number, or decision from the article. Return [] if content is missing.
- explanation: 2 sentences on what this means for Sai Kiran personally. Be concrete: "You should…", "This affects your…", "Watch for…". No corporate filler.

Return ONLY valid JSON (no prose, no code fences):
{"items":[{"id":"...","importance":0,"category":"AI & ML","reason":"...","summary":"...","takeaways":["..."],"explanation":"..."},...]}
Sort by importance descending.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: JSON.stringify(
              items.map(({ id, title, source }) => ({
                id,
                title,
                source,
                content: contents.get(id) ?? null,
              }))
            ),
          },
        ],
      }),
      signal: AbortSignal.timeout(28000),
    });

    if (!res.ok) return fallback(items);

    const payload = await res.json().catch(() => ({}));
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return fallback(items);

    const parsed = JSON.parse(content) as {
      items?: Array<{
        id: string;
        importance: number;
        category: string;
        reason: string;
        summary?: string;
        takeaways?: string[];
        explanation?: string;
      }>;
    };
    if (!Array.isArray(parsed.items)) return fallback(items);

    const scoreMap = new Map(parsed.items.map((s) => [s.id, s]));
    return items
      .map((item) => {
        const s = scoreMap.get(item.id);
        return {
          ...item,
          importance: typeof s?.importance === "number" ? s.importance : 50,
          category: (s?.category ?? "Tech") as AgentNewsItem["category"],
          reason: s?.reason ?? "",
          summary: s?.summary ?? "",
          takeaways: Array.isArray(s?.takeaways) ? s!.takeaways.filter((t) => typeof t === "string" && t.trim()) : [],
          explanation: s?.explanation ?? "",
        };
      })
      .sort((a, b) => b.importance - a.importance);
  } catch {
    return fallback(items);
  }
}

function fallback(items: RawItem[]): AgentNewsItem[] {
  return items.map((item) => ({
    ...item,
    importance: 50,
    category: "Tech" as const,
    reason: "",
    summary: "",
    takeaways: [],
    explanation: "",
  }));
}

export async function buildFeed(): Promise<FeedResult> {
  const [hn, devTo, visa] = await Promise.allSettled([
    fetchHackerNews(),
    fetchDevTo(),
    fetchVisaNews(),
  ]);

  const raw: RawItem[] = [
    ...(hn.status === "fulfilled" ? hn.value : []),
    ...(devTo.status === "fulfilled" ? devTo.value : []),
    ...(visa.status === "fulfilled" ? visa.value : []),
  ];

  // Fetch each article's real body via Jina Reader in parallel (cap 6 at a
  // time so we don't blow through the free rate limit). Failures fall back
  // to title-only ranking for that item.
  const contents = new Map<string, string | null>();
  const fetched = await withConcurrency(raw, 6, (item) =>
    fetchArticleContent(item.url).then((c) => [item.id, c] as const)
  );
  for (const [id, content] of fetched) contents.set(id, content);

  return {
    items: await rankWithGroq(raw, contents),
    fetchedAt: new Date().toISOString(),
    sources: {
      hn: hn.status === "fulfilled" ? hn.value.length : 0,
      devTo: devTo.status === "fulfilled" ? devTo.value.length : 0,
      visa: visa.status === "fulfilled" ? visa.value.length : 0,
    },
  };
}
