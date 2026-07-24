import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/content — every section, for the admin dashboard. */
export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } = await auth.supabase.from("portfolio_content").select("section, data");
  if (error) {
    return NextResponse.json({ error: "Could not read content" }, { status: 500 });
  }

  return NextResponse.json(Object.fromEntries(data.map((row) => [row.section, row.data])));
}
