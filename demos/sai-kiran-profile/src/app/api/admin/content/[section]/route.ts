import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ALLOWED_SECTIONS, type SectionKey } from "@/lib/content-types";

/** PUT /api/admin/content/:section — replace one section's content. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { section } = await params;
  if (!ALLOWED_SECTIONS.includes(section as SectionKey)) {
    return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("portfolio_content")
    .upsert({ section, data: body, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: "Could not save content" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, section, data: body });
}
