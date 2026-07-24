import { requireAuth } from "@/lib/auth";
import type { Contact } from "@/lib/crm-types";
import CrmTable from "./CrmTable";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const auth = await requireAuth();
  const { data } = auth
    ? await auth.supabase.from("contacts").select("*").order("created_at", { ascending: false })
    : { data: [] };

  return <CrmTable initialContacts={(data ?? []) as Contact[]} />;
}
