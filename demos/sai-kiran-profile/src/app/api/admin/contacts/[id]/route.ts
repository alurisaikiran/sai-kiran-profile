import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/crm-types";

/** PATCH /api/admin/contacts/:id — update status and/or notes. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const patch: { status?: ContactStatus; notes?: string | null } = {};

  if (body.status !== undefined) {
    if (!CONTACT_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `Unknown status: ${body.status}` }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.notes !== undefined) {
    patch.notes = body.notes === null ? null : String(body.notes);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("contacts")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not update contact" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ contact: data });
}

/** DELETE /api/admin/contacts/:id */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await auth.supabase.from("contacts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not delete contact" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
