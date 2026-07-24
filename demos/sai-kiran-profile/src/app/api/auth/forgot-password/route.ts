import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth";

/**
 * Always responds ok — Supabase doesn't reveal whether an email is
 * registered, so neither do we.
 */
export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/login`,
  });

  return NextResponse.json({ ok: true });
}
