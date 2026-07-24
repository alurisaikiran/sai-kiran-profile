/**
 * Content routes — mounted at /api in server/index.js.
 *
 * Public:
 *   GET /api/content              → returns portfolio content (no auth)
 *
 * Admin (Supabase session cookie required):
 *   GET /api/admin/content            → same data, for the admin SPA
 *   PUT /api/admin/content/:section    → update one section
 *   POST /api/admin/upload             → upload an image, returns its URL
 */

import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { createSupabaseClient } from "../lib/supabase.js";

const router = Router();

const ALLOWED_SECTIONS = [
  "hero", "stats", "about", "skills",
  "projects", "launched", "experience",
  "credentials", "contact",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

async function readContent(supabase) {
  const { data, error } = await supabase.from("portfolio_content").select("section, data");
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.section, row.data]));
}

/* ── Public ── */
router.get("/content", async (_req, res) => {
  try {
    const supabase = createSupabaseClient();
    res.json(await readContent(supabase));
  } catch {
    res.status(500).json({ error: "Could not read content" });
  }
});

/* ── Admin (auth required) ── */
router.get("/admin/content", requireAuth, async (req, res) => {
  try {
    res.json(await readContent(req.supabase));
  } catch {
    res.status(500).json({ error: "Could not read content" });
  }
});

router.put("/admin/content/:section", requireAuth, async (req, res) => {
  const { section } = req.params;

  if (!ALLOWED_SECTIONS.includes(section)) {
    return res.status(400).json({ error: `Unknown section: ${section}` });
  }

  try {
    const { error } = await req.supabase
      .from("portfolio_content")
      .upsert({ section, data: req.body, updated_at: new Date().toISOString() });
    if (error) throw error;
    res.json({ ok: true, section, data: req.body });
  } catch {
    res.status(500).json({ error: "Could not save content" });
  }
});

router.post("/admin/upload", requireAuth, (req, res) => {
  upload.single("file")(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || "Upload failed" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const objectPath = `uploads/${Date.now()}-${safeName}`;

    try {
      const { error } = await req.supabase.storage
        .from("portfolio-assets")
        .upload(objectPath, req.file.buffer, { contentType: req.file.mimetype });
      if (error) throw error;

      const { data } = req.supabase.storage.from("portfolio-assets").getPublicUrl(objectPath);
      res.json({ url: data.publicUrl });
    } catch {
      res.status(500).json({ error: "Upload failed" });
    }
  });
});

export default router;
