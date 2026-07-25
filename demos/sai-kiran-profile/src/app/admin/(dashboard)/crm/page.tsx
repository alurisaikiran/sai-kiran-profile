import { requireAuth } from "@/lib/auth";
import { getTokens } from "@/lib/gmail";
import type { Contact, ContactExclusion } from "@/lib/crm-types";
import CrmWorkspace from "./CrmWorkspace";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const auth = await requireAuth();
  if (!auth) return null;

  const [{ data: contacts }, { data: exclusions }, tokens] = await Promise.all([
    auth.supabase.from("contacts").select("*").order("created_at", { ascending: false }),
    auth.supabase.from("contact_exclusions").select("*").order("created_at", { ascending: false }),
    getTokens(auth.supabase, auth.user.id),
  ]);

  return (
    <CrmWorkspace
      initialContacts={(contacts ?? []) as Contact[]}
      initialExclusions={(exclusions ?? []) as ContactExclusion[]}
      gmailConnected={Boolean(tokens?.access_token)}
    />
  );
}
