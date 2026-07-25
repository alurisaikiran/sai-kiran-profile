import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

/** DELETE /api/admin/exclusions/:id — lift a suppression. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await auth.supabase.from("contact_exclusions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not remove exclusion" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
