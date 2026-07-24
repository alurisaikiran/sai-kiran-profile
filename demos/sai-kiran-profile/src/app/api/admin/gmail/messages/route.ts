import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAccessToken, listMessages } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/gmail/messages — live inbox fetch.
 * Nothing is persisted; mailbox content stays in Gmail.
 */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { token, error } = await getAccessToken(auth.supabase, auth.user.id);
  if (!token) {
    return NextResponse.json({ error: error ?? "Gmail is not connected" }, { status: 400 });
  }

  const url = new URL(request.url);
  const result = await listMessages(token, {
    maxResults: Number(url.searchParams.get("limit") ?? 25),
    pageToken: url.searchParams.get("pageToken") ?? undefined,
    query: url.searchParams.get("q") ?? undefined,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    messages: result.messages,
    nextPageToken: result.nextPageToken ?? null,
  });
}
