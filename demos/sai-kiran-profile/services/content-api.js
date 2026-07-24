/**
 * Content API client.
 *
 * When the Express backend is running, fetches live content from /api/content.
 * Falls back to the static data/content.js exports when the backend is unavailable
 * (e.g. static hosting, local file:// preview).
 *
 * Admin mutations go through the /api/admin/* routes, authenticated via an
 * httpOnly session cookie set by /api/auth/login (no token handling in JS).
 */

import * as staticContent from "../data/content.js";

const API_BASE = "/api";
const TIMEOUT_MS = 3000;

/** Returns the full portfolio content object, backend or static. */
export async function fetchContent() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(`${API_BASE}/content`, { signal: controller.signal });
    clearTimeout(id);
    if (res.ok) return res.json();
  } catch {
    // Backend unreachable — silent fallback to static file.
  }
  return staticContent;
}

/** Admin: save a single content section. Returns the saved data. */
export async function saveSection(section, data) {
  const res = await fetch(`${API_BASE}/admin/content/${section}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);
  return res.json();
}

/** Admin: upload an image file. Returns its public URL. */
export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

/** Admin: authenticate. Session is carried via an httpOnly cookie. */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Login failed");
  }
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "same-origin" });
}

/** Admin: true if the session cookie is present and still valid. */
export async function checkSession() {
  const res = await fetch(`${API_BASE}/admin/content`, { credentials: "same-origin" });
  return res.ok;
}
