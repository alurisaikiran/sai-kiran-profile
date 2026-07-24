/**
 * Express server.
 * - Serves the static public site from the project root.
 * - Exposes /api/auth and /api/* content routes.
 *
 * Start: npm start
 * Dev:   npm run dev   (auto-restarts on file change)
 */

import express      from "express";
import path         from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import "dotenv/config";

import authRoutes    from "./routes/auth.js";
import contentRoutes from "./routes/content.js";

const __dir       = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dir, "..");
const PORT        = process.env.PORT ?? 3000;

// ── Validation ──────────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_ANON_KEY not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();

app.use(express.json());
app.use(cookieParser());

// Serve the frontend from the project root.
// /admin/ resolves to admin/index.html automatically.
app.use(express.static(projectRoot));

// /api/auth/*                 → login
// /api/content                → public content GET
// /api/admin/content          → admin content GET (auth)
// /api/admin/content/:section → admin content PUT (auth)
app.use("/api/auth", authRoutes);
app.use("/api",      contentRoutes);

// Fallback: serve index.html for any unmatched path (SPA behaviour).
app.get("*", (_req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio  →  http://localhost:${PORT}`);
  console.log(`Admin      →  http://localhost:${PORT}/admin/`);
});
