import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const RESUME_BUCKET = "resumes";
const MAX_BYTES = 3 * 1024 * 1024; // Keeps the encoded email well inside Gmail's limit.
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** GET /api/admin/resume — the current resume, if one is uploaded. */
export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data } = await auth.supabase
    .from("resumes")
    .select("*")
    .eq("is_current", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ resume: data ?? null });
}

/** POST /api/admin/resume — upload a resume and make it the current one. */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Resume must be a PDF or Word document" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Resume must be under 3MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storagePath = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await auth.supabase.storage
    .from(RESUME_BUCKET)
    .upload(storagePath, await file.arrayBuffer(), { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Only one resume is ever "current" — demote the rest.
  await auth.supabase.from("resumes").update({ is_current: false }).eq("is_current", true);

  const { data, error } = await auth.supabase
    .from("resumes")
    .insert({
      filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      is_current: true,
    })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not record the upload" }, { status: 500 });
  }

  return NextResponse.json({ resume: data });
}

/** DELETE /api/admin/resume — remove the current resume. */
export async function DELETE() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: current } = await auth.supabase
    .from("resumes")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ ok: true });
  }

  await auth.supabase.storage.from(RESUME_BUCKET).remove([current.storage_path]);
  await auth.supabase.from("resumes").delete().eq("id", current.id);

  return NextResponse.json({ ok: true });
}
