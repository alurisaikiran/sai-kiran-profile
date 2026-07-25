import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { draftEmail } from "@/lib/groq";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/ai/draft-email
 * Body: { prompt, hasResume?, senderName? }
 *
 * Returns a draft subject and body for the admin to review and edit. This
 * route never sends anything — sending stays behind the confirm step in
 * /api/admin/gmail/send.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt ?? "").trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "Describe what the email should say" },
      { status: 400 }
    );
  }
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "That prompt is too long" }, { status: 400 });
  }

  const { draft, error } = await draftEmail({
    prompt,
    senderName: body?.senderName ? String(body.senderName) : undefined,
    hasResume: body?.hasResume === true,
  });

  if (error || !draft) {
    return NextResponse.json({ error: error ?? "Could not draft the email" }, { status: 502 });
  }

  return NextResponse.json({ draft });
}
