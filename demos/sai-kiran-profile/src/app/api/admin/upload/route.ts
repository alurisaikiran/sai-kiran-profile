import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ASSETS_BUCKET } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024;

/** POST /api/admin/upload — stores an image in Supabase Storage, returns its URL. */
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
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const objectPath = `uploads/${Date.now()}-${safeName}`;

  const { error } = await auth.supabase.storage
    .from(ASSETS_BUCKET)
    .upload(objectPath, await file.arrayBuffer(), { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data } = auth.supabase.storage.from(ASSETS_BUCKET).getPublicUrl(objectPath);
  return NextResponse.json({ url: data.publicUrl });
}
