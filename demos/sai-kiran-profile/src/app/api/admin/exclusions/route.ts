import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { EXCLUSION_KINDS, isValidEmail, type ExclusionKind } from "@/lib/crm-types";

export const dynamic = "force-dynamic";

/** GET /api/admin/exclusions — the suppression list. */
export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } = await auth.supabase
    .from("contact_exclusions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not read exclusions" }, { status: 500 });
  }
  return NextResponse.json({ exclusions: data });
}

/** POST /api/admin/exclusions — suppress an address or a whole domain. */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const kind: ExclusionKind = EXCLUSION_KINDS.includes(body.kind) ? body.kind : "email";
  const value = String(body.value ?? "").trim().toLowerCase().replace(/^@/, "");

  if (!value) {
    return NextResponse.json({ error: "Enter an email address or domain" }, { status: 400 });
  }
  if (kind === "email" && !isValidEmail(value)) {
    return NextResponse.json({ error: "That isn't a valid email address" }, { status: 400 });
  }
  if (kind === "domain" && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) {
    return NextResponse.json({ error: "That isn't a valid domain" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("contact_exclusions")
    .insert({ value, kind, reason: body.reason ? String(body.reason) : null })
    .select()
    .maybeSingle();

  if (error) {
    // 23505 = unique violation, i.e. it's already suppressed.
    if (error.code === "23505") {
      return NextResponse.json({ error: `${value} is already excluded` }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not add exclusion" }, { status: 500 });
  }

  return NextResponse.json({ exclusion: data });
}
