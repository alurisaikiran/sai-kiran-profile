/**
 * Vercel serverless entry point.
 * Exposes the same /api/* Express app used locally by server/index.js.
 * Static files (index.html, admin/, main.js, styles/, etc.) are served
 * natively by Vercel — see vercel.json's rewrite, which sends only /api/*
 * requests here.
 */
export { default } from "../server/app.js";
