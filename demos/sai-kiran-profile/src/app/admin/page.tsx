import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();
  return <AdminDashboard session={session} initialContent={content} />;
}
