import { createPublicClient } from "./supabase";
import fallback from "../../data/portfolio.json";
import type { SiteContent } from "./content-types";

/**
 * Reads every section from Supabase and folds it into one object.
 * Falls back to the bundled data/portfolio.json when the table is empty or
 * unreachable, so the site always renders rather than erroring out.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const base = fallback as unknown as SiteContent;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("portfolio_content").select("section, data");
    if (error || !data?.length) return base;

    const live = Object.fromEntries(data.map((row) => [row.section, row.data]));
    return { ...base, ...live } as SiteContent;
  } catch {
    return base;
  }
}
