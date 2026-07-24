import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getOAuthEnv, getTokens } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/** GET /api/admin/gmail/status — is Gmail connected, and as which account? */
export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const row = await getTokens(auth.supabase, auth.user.id);
  return NextResponse.json({
    configured: Boolean(getOAuthEnv()),
    connected: Boolean(row?.access_token),
    email: row?.email ?? null,
  });
}
