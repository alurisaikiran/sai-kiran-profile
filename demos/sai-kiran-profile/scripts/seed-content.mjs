/**
 * One-off migration: pushes server/data/portfolio.json into the
 * `portfolio_content` Supabase table.
 *
 * Usage:
 *   node scripts/seed-content.mjs <admin-email> <admin-password>
 *
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY in .env (writes go through
 * RLS as the authenticated admin user — no service-role key needed).
 */
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const PORTFOLIO_PATH = path.resolve(__dir, "../server/data/portfolio.json");

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/seed-content.mjs <admin-email> <admin-password>");
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_ANON_KEY not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
