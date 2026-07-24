/**
 * One-off migration: pushes data/portfolio.json into the
 * `portfolio_content` Supabase table.
 *
 * Usage:
 *   npm run seed -- <admin-email> <admin-password>
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from
 * .env.local. Writes go through RLS as the authenticated admin user —
 * no service-role key needed.
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dir, "../.env.local") });

const PORTFOLIO_PATH = path.resolve(__dir, "../data/portfolio.json");

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: npm run seed -- <admin-email> <admin-password>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("ERROR: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local.");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
if (signInError) {
  console.error("Sign-in failed:", signInError.message);
  process.exit(1);
}

const portfolio = JSON.parse(await readFile(PORTFOLIO_PATH, "utf-8"));
const rows = Object.entries(portfolio).map(([section, data]) => ({
  section,
  data,
  updated_at: new Date().toISOString(),
}));

const { error: upsertError } = await supabase.from("portfolio_content").upsert(rows);
if (upsertError) {
  console.error("Seed failed:", upsertError.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} sections into portfolio_content:`, rows.map((r) => r.section).join(", "));
await supabase.auth.signOut();
