import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteTokens } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/** POST /api/admin/gmail/disconnect — forgets the stored Gmail tokens. */
export async function POST() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  await deleteTokens(auth.supabase, auth.user.id);
  return NextResponse.json({ ok: true });
}
