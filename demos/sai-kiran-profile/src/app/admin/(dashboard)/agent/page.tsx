import { requireAuth } from "@/lib/auth";
import AgentFeed from "@/components/admin/AgentFeed";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const auth = await requireAuth();
  if (!auth) return null;

  return (
    <div className="admin-content">
      <AgentFeed />
    </div>
  );
}
