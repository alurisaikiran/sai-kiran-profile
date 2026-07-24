/**
 * Local dev / self-hosted server.
 * - Serves the static public site from the project root.
 * - Mounts the /api/* app from server/app.js.
 *
 * On Vercel, this file isn't used at all — api/index.js exposes the same
 * /api/* app as a serverless function, and Vercel serves the static files
 * (index.html, admin/, main.js, styles/, etc.) natively. See vercel.json.
 *
 * Start: npm start
 * Dev:   npm run dev   (auto-restarts on file change)
 */

import express from "express";
import path    from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import app from "./app.js";

const __dir       = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dir, "..");
const PORT        = process.env.PORT ?? 3000;

// ── Validation ──────────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("ERROR: SUPABASE_URL / SUPABASE_ANON_KEY not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

// Serve the frontend from the project root.
// /admin/ resolves to admin/index.html automatically.
app.use(express.static(projectRoot));

// Fallback: serve index.html for any unmatched path (SPA behaviour).
app.get("*", (_req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio  →  http://localhost:${PORT}`);
  console.log(`Admin      →  http://localhost:${PORT}/admin/`);
});
