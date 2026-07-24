import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAccessToken, sendEmail } from "@/lib/gmail";
import { isValidEmail } from "@/lib/crm-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Hard ceiling per request. Guards against a UI bug mailing the whole list. */
export const MAX_RECIPIENTS = 50;

/**
 * POST /api/admin/gmail/send
 * Body: { recipients: string[], subject, body, confirm: true, dryRun?: boolean }
 *
 * Sends one individual message per recipient (never a shared To: line, so
 * recipients can't see each other). `confirm` must be explicitly true — the
 * UI sets it only after the operator has reviewed the recipient list.
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const subject = String(body.subject ?? "").trim();
  const message = String(body.body ?? "").trim();
  const recipients: string[] = Array.isArray(body.recipients)
    ? [...new Set<string>(body.recipients.map((r: unknown) => String(r).trim().toLowerCase()))]
    : [];

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }
  if (recipients.length === 0) {
    return NextResponse.json({ error: "Pick at least one recipient" }, { status: 400 });
  }
  if (recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `Too many recipients (${recipients.length}). The limit is ${MAX_RECIPIENTS} per send.` },
      { status: 400 }
    );
  }

  const invalid = recipients.filter((r) => !isValidEmail(r));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid email address: ${invalid[0]}` },
      { status: 400 }
    );
  }

  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "Send was not confirmed" },
      { status: 400 }
    );
  }

  const { token, email: fromEmail, error } = await getAccessToken(auth.supabase, auth.user.id);
  if (!token) {
    return NextResponse.json({ error: error ?? "Gmail is not connected" }, { status: 400 });
  }

  // Dry run reports exactly what would go out, without contacting Gmail.
  if (body.dryRun === true) {
    return NextResponse.json({
      dryRun: true,
      wouldSend: recipients.length,
      from: fromEmail,
      recipients,
    });
  }

  const sent: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const to of recipients) {
    const result = await sendEmail(token, {
      from: fromEmail ?? "me",
      to,
      subject,
      body: message,
    });
    if (result.ok) {
      sent.push(to);
    } else {
      failed.push({ email: to, error: result.error ?? "unknown error" });
    }
  }

  if (sent.length > 0) {
    await auth.supabase
      .from("contacts")
      .update({ status: "replied", last_contacted_at: new Date().toISOString() })
      .in("email", sent);
  }

  return NextResponse.json({ sent: sent.length, failed });
}
