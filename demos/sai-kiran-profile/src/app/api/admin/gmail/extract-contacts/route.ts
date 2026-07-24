import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { companyFromEmail, getAccessToken, listMessages } from "@/lib/gmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SCAN = 200;

/**
 * POST /api/admin/gmail/extract-contacts
 *
 * Scans recent messages, pulls the sender out of each, and saves any address
 * not already in the CRM. Idempotent: re-running only adds genuinely new
 * senders, because existing emails are filtered out first.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { token, email: ownEmail, error } = await getAccessToken(auth.supabase, auth.user.id);
  if (!token) {
    return NextResponse.json({ error: error ?? "Gmail is not connected" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const scanLimit = Math.min(Number(body.limit) || 100, MAX_SCAN);

  const { messages, error: listError } = await listMessages(token, {
    maxResults: scanLimit,
    query: body.query || undefined,
  });
  if (listError) {
    return NextResponse.json({ error: listError }, { status: 502 });
  }

  // Collapse to one entry per sender, keeping the first name we saw.
  const senders = new Map<string, { name: string; email: string }>();
  for (const msg of messages) {
    if (!msg.fromEmail || msg.fromEmail === ownEmail) continue;
    if (!senders.has(msg.fromEmail)) {
      senders.set(msg.fromEmail, { name: msg.fromName, email: msg.fromEmail });
    }
  }

  if (senders.size === 0) {
    return NextResponse.json({ scanned: messages.length, added: 0, skipped: 0 });
  }

  const { data: existingRows } = await auth.supabase
    .from("contacts")
    .select("email")
    .in("email", [...senders.keys()]);

  const existing = new Set((existingRows ?? []).map((r) => r.email as string));
  const fresh = [...senders.values()].filter((s) => !existing.has(s.email));

  if (fresh.length > 0) {
    const { error: insertError } = await auth.supabase.from("contacts").insert(
      fresh.map((s) => ({
        name: s.name,
        email: s.email,
        company: companyFromEmail(s.email),
        source: "gmail",
      }))
    );
    if (insertError) {
      return NextResponse.json({ error: "Could not save extracted contacts" }, { status: 500 });
    }
  }

  return NextResponse.json({
    scanned: messages.length,
    added: fresh.length,
    skipped: senders.size - fresh.length,
  });
}
