import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { buildAuthUrl, getOAuthEnv } from "@/lib/gmail";

export const dynamic = "force-dynamic";

/** GET /api/admin/gmail/auth — redirects to Google's consent screen. */
export async function GET(request: Request) {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const origin = new URL(request.url).origin;

  if (!getOAuthEnv(origin)) {
    return NextResponse.json(
      {
        error:
          "Gmail OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET, then add this app's /api/admin/gmail/callback URL to the OAuth client's authorized redirect URIs in Google Cloud Console.",
      },
      { status: 503 }
    );
  }

  const url = buildAuthUrl(crypto.randomUUID(), origin);
  if (!url) {
    return NextResponse.json({ error: "Could not build the consent URL" }, { status: 500 });
  }

  return NextResponse.redirect(url);
}
