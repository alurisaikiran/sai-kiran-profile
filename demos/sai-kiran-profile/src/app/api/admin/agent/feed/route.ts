import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { buildFeed } from "@/lib/agent-feed";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CACHE_ID = "latest";

/** GET — reads from the Supabase cache (fast, no external fetching). */
export async function GET() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data, error } = await auth.supabase
    .from("agent_feed_cache")
    .select("items, fetched_at, sources")
    .eq("id", CACHE_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data) {
    return NextResponse.json({ items: [], fetchedAt: null, sources: null });
  }

  return NextResponse.json({
    items: data.items,
    fetchedAt: data.fetched_at,
    sources: data.sources,
  });
}

/** POST — fetches fresh news, ranks with Groq, saves to cache. No email is sent. */
export async function POST() {
  const auth = await requireAuth();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const feed = await buildFeed();

  const { error } = await auth.supabase.from("agent_feed_cache").upsert({
    id: CACHE_ID,
    items: feed.items,
    fetched_at: feed.fetchedAt,
    sources: feed.sources,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(feed);
}
