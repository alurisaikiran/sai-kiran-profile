import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase";
import { CONTACT_LIMITS, isValidEmail } from "@/lib/crm-types";

export const dynamic = "force-dynamic";

/**
 * POST /api/contact — public contact-form submission.
 *
 * Runs as `anon`, which RLS restricts to inserting contact_form rows only.
 * Every submission is its own row — the admin sees each message rather than
 * having a repeat sender overwrite their earlier one.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real users never see this field, bots fill everything.
  // Respond 200 so scripts can't tell they were filtered.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const message = String(body.message ?? "").trim();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (
    name.length > CONTACT_LIMITS.name ||
    message.length > CONTACT_LIMITS.message
  ) {
    return NextResponse.json({ error: "Submission is too long" }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("contacts").insert({
    name,
    email,
    message: message || null,
    source: "contact_form",
  });

  if (error) {
    return NextResponse.json({ error: "Could not send your message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
