import { getSiteContent } from "@/lib/content";
import ContentEditor from "./ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return <ContentEditor initialContent={content} />;
}
