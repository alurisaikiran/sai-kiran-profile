/**
 * The API-only Express app: JSON parsing, cookies, and the /api/* routes.
 * No static file serving here — that's added by server/index.js for local
 * dev, while Vercel serves static files natively and only routes /api/*
 * to this app (see api/index.js + vercel.json).
 */
import express      from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes    from "./routes/auth.js";
import contentRoutes from "./routes/content.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// /api/auth/*                 → login
// /api/content                → public content GET
// /api/admin/content          → admin content GET (auth)
// /api/admin/content/:section → admin content PUT (auth)
app.use("/api/auth", authRoutes);
app.use("/api",      contentRoutes);

export default app;
