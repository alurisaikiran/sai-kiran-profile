import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAccessToken, sendEmail, type EmailAttachment } from "@/lib/gmail";
import { isExcluded, isValidEmail, type ContactExclusion } from "@/lib/crm-types";

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

  // Suppression list is enforced here, not just in the UI — an excluded
  // address must be unmailable regardless of what the client sends.
  const { data: exclusionRows } = await auth.supabase.from("contact_exclusions").select("*");
  const exclusions = (exclusionRows ?? []) as ContactExclusion[];
  const allowed = recipients.filter((r) => !isExcluded(r, exclusions));
  const suppressed = recipients.length - allowed.length;

  if (allowed.length === 0) {
    return NextResponse.json(
      { error: "Every selected recipient is on the exclusion list" },
      { status: 400 }
    );
  }

  const { token, email: fromEmail, error } = await getAccessToken(auth.supabase, auth.user.id);
  if (!token) {
    return NextResponse.json({ error: error ?? "Gmail is not connected" }, { status: 400 });
  }

  // Resolve the resume once, not per recipient.
  let attachment: EmailAttachment | undefined;
  if (body.attachResume === true) {
    const { data: resume } = await auth.supabase
      .from("resumes")
      .select("*")
      .eq("is_current", true)
      .maybeSingle();

    if (!resume) {
      return NextResponse.json(
        { error: "No resume uploaded — add one in Settings first" },
        { status: 400 }
      );
    }

    const { data: file, error: downloadError } = await auth.supabase.storage
      .from("resumes")
      .download(resume.storage_path);

    if (downloadError || !file) {
      return NextResponse.json({ error: "Could not read the stored resume" }, { status: 500 });
    }

    attachment = {
      filename: resume.filename,
      mimeType: resume.mime_type,
      content: await file.arrayBuffer(),
    };
  }

  // Dry run reports exactly what would go out, without contacting Gmail.
  if (body.dryRun === true) {
    return NextResponse.json({
      dryRun: true,
      wouldSend: allowed.length,
      suppressed,
      from: fromEmail,
      recipients: allowed,
      attachment: attachment?.filename ?? null,
    });
  }

  const sent: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  for (const to of allowed) {
    const result = await sendEmail(token, {
      from: fromEmail ?? "me",
      to,
      subject,
      body: message,
      attachment,
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

  return NextResponse.json({ sent: sent.length, failed, suppressed });
}
