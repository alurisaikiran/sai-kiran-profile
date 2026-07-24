import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth";

/** Completes a reset using the tokens from the recovery link Supabase emailed. */
export async function POST(request: Request) {
  const { access_token, refresh_token, new_password } = await request.json().catch(() => ({}));

  if (!access_token || !refresh_token || !new_password) {
    return NextResponse.json({ error: "Reset link is missing required data" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) {
    return NextResponse.json({ error: "This reset link is invalid or expired" }, { status: 401 });
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: new_password });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
