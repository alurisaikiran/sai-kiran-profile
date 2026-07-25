import { requireAuth } from "@/lib/auth";
import { getTokens } from "@/lib/gmail";
import { isGroqConfigured } from "@/lib/groq";
import type { Contact, ContactExclusion } from "@/lib/crm-types";
import InboxClient from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const auth = await requireAuth();
  if (!auth) return null;

  const [tokens, { data: contacts }, { data: exclusions }, { data: resume }] = await Promise.all([
    getTokens(auth.supabase, auth.user.id),
    auth.supabase.from("contacts").select("*").order("created_at", { ascending: false }),
    auth.supabase.from("contact_exclusions").select("*"),
    auth.supabase.from("resumes").select("filename").eq("is_current", true).maybeSingle(),
  ]);

  return (
    <InboxClient
      connected={Boolean(tokens?.access_token)}
      connectedEmail={tokens?.email ?? null}
      contacts={(contacts ?? []) as Contact[]}
      exclusions={(exclusions ?? []) as ContactExclusion[]}
      resumeFilename={(resume as { filename: string } | null)?.filename ?? null}
      aiEnabled={isGroqConfigured()}
    />
  );
}
