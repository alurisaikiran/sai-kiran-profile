import { requireAuth } from "@/lib/auth";
import { getTokens } from "@/lib/gmail";
import type { Contact } from "@/lib/crm-types";
import InboxClient from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const auth = await requireAuth();
  if (!auth) return null;

  const tokens = await getTokens(auth.supabase, auth.user.id);
  const connected = Boolean(tokens?.access_token);

  const { data: contacts } = await auth.supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <InboxClient
      connected={connected}
      connectedEmail={tokens?.email ?? null}
      contacts={(contacts ?? []) as Contact[]}
    />
  );
}
