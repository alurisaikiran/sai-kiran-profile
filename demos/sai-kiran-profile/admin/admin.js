/**
 * Admin SPA.
 * Manages authentication state and renders a section editor for each
 * content block in portfolio.json.
 * All API calls go through /api/admin/* (Supabase session cookie).
 */

import { login, logout, checkSession, saveSection, uploadImage } from "../services/content-api.js";

const root = document.getElementById("admin-root");

// ── Router ───────────────────────────────────────────────────────────────────
async function init() {
  if (await checkSession()) {
    renderDashboard();
  } else {
    renderLogin();
  }
}

// ── Login screen ─────────────────────────────────────────────────────────────
function renderLogin() {
  root.innerHTML = `
    <div class="admin-login-wrap">
      <div class="admin-login-card">
        <h1>Admin Login</h1>
        <p>Sai Kiran Aluri · Portfolio CMS</p>
        <div id="login-notice"></div>
        <form id="login-form">
          <div class="admin-field">
            <label for="email">Email</label>
            <input class="admin-input" id="email" type="email" autocomplete="username" required>
          </div>
          <div class="admin-field">
            <label for="password">Password</label>
            <input class="admin-input" id="password" type="password" autocomplete="current-password" required>
          </div>
          <button class="admin-btn primary" type="submit" style="width:100%">Sign in</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const notice  = document.getElementById("login-notice");
    const btn     = e.target.querySelector("button");
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    btn.disabled = true;
    btn.textContent = "Signing in…";
    notice.innerHTML = "";

    try {
      await login(email, password);
      renderDashboard();
    } catch (err) {
      notice.innerHTML = `<div class="admin-notice error">${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}

// ── Dashboard ────────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "hero",        label: "Hero" },
  { key: "about",       label: "About" },
  { key: "skills",      label: "Skills" },
  { key: "experience",  label: "Experience" },
  { key: "credentials", label: "Credentials" },
  { key: "contact",     label: "Contact" },
];

const EMPTY_EXPERIENCE_ITEM = { date: "", title: "", description: "", tags: [] };
const EMPTY_CREDENTIAL_ITEM = { badge: "", title: "", subtitle: "" };

let activeSection = SECTIONS[0].key;
let portfolioData = null;

async function renderDashboard() {
  root.innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand-mark">SK</span>
          <span>CMS</span>
        </div>
        ${SECTIONS.map(({ key, label }) =>
          `<button class="admin-nav-item${key === activeSection ? " active" : ""}" data-section="${key}">${label}</button>`
        ).join("")}
        <div class="admin-nav-footer">
          <a href="/" target="_blank" class="admin-btn ghost" style="display:block;text-align:center;margin-bottom:8px">View Site</a>
          <button class="admin-btn ghost" id="logout-btn" style="width:100%">Sign out</button>
        </div>
      </aside>
      <div class="admin-main">
        <div class="admin-topbar">
          <h1 id="section-title">${SECTIONS.find((s) => s.key === activeSection)?.label}</h1>
          <button class="admin-btn primary" id="save-btn">Save changes</button>
        </div>
        <div class="admin-content">
          <div id="editor-notice"></div>
          <div id="editor-area"><p style="color:var(--admin-muted)">Loading…</p></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await logout();
    renderLogin();
  });

  document.getElementById("save-btn").addEventListener("click", handleSave);

  document.querySelectorAll(".admin-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSection = btn.dataset.section;
      document.querySelectorAll(".admin-nav-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("section-title").textContent =
        SECTIONS.find((s) => s.key === activeSection)?.label;
      renderEditor();
    });
  });

  await loadData();
  renderEditor();
}

async function loadData() {
  try {
    const res = await fetch("/api/admin/content", { credentials: "same-origin" });
    if (!res.ok) throw new Error("auth");
    portfolioData = await res.json();
  } catch {
    // Session may have expired — force re-login.
    await logout();
    renderLogin();
  }
}

// ── Editors ──────────────────────────────────────────────────────────────────
function renderEditor() {
  const area = document.getElementById("editor-area");
  if (!portfolioData) return;

  const data = portfolioData[activeSection];

  switch (activeSection) {
    case "hero":        area.innerHTML = heroEditor(data);        break;
    case "about":       area.innerHTML = aboutEditor(data);       break;
    case "skills":      area.innerHTML = skillsEditor(data);      break;
    case "experience":  area.innerHTML = experienceEditor(data);  break;
    case "credentials": area.innerHTML = credentialsEditor(data); break;
    case "contact":     area.innerHTML = contactEditor(data);     break;
    default:            area.innerHTML = genericEditor(data);
  }

  initTagEditors(area);
  initImageUploads(area);
  initListEditors(area);
}

async function handleSave() {
  const btn    = document.getElementById("save-btn");
  const notice = document.getElementById("editor-notice");

  btn.disabled    = true;
  btn.textContent = "Saving…";
  notice.innerHTML = "";

  try {
    const data = collectEditorData();
    portfolioData[activeSection] = data;
    await saveSection(activeSection, data);
    notice.innerHTML = `<div class="admin-notice success">Saved successfully.</div>`;
  } catch (err) {
    notice.innerHTML = `<div class="admin-notice error">Save failed: ${err.message}</div>`;
  } finally {
    btn.disabled    = false;
    btn.textContent = "Save changes";
    setTimeout(() => { notice.innerHTML = ""; }, 4000);
  }
}

/** Read current form values back into a data object matching portfolio.json shape. */
function collectEditorData() {
  const area = document.getElementById("editor-area");
  const data = structuredClone(portfolioData[activeSection]);

  // Text inputs (and image hidden fields, which share the same [data-field] contract)
  area.querySelectorAll("[data-field]").forEach((el) => {
    const path = el.dataset.field.split(".");
    let obj = data;
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    obj[path[path.length - 1]] = el.value;
  });

  // Tag lists
  area.querySelectorAll("[data-tag-field]").forEach((tagList) => {
    const field = tagList.dataset.tagField.split(".");
    const tags  = [...tagList.querySelectorAll(".admin-tag [data-tag-value]")].map((t) => t.textContent);
    let obj = data;
    for (let i = 0; i < field.length - 1; i++) obj = obj[field[i]];
    obj[field[field.length - 1]] = tags;
  });

  return data;
}

// ── Section-specific editors ──────────────────────────────────────────────────
function heroEditor(d) {
  return `
    <div class="admin-section-card">
      <h2>Hero</h2>
      ${imageField("Photo", "photo", d.photo)}
      ${field("Name",        "name",        d.name)}
      ${field("Eyebrow",     "eyebrow",     d.eyebrow)}
      ${field("Description", "description", d.description, true)}
      ${tagField("Roles", "roles", d.roles)}
    </div>`;
}

function aboutEditor(d) {
  return `
    <div class="admin-section-card">
      <h2>About</h2>
      ${field("Eyebrow", "eyebrow", d.eyebrow)}
      ${field("Heading",  "heading", d.heading)}
      ${field("Paragraph 1", "paragraphs.0", d.paragraphs[0], true)}
      ${field("Paragraph 2", "paragraphs.1", d.paragraphs[1], true)}
    </div>
    ${d.cards.map((card, i) => `
      <div class="admin-section-card">
        <h2>Card ${i + 1}</h2>
        ${field("Number",      `cards.${i}.number`,      card.number)}
        ${field("Title",       `cards.${i}.title`,       card.title)}
        ${field("Description", `cards.${i}.description`, card.description, true)}
      </div>`
    ).join("")}`;
}

function skillsEditor(d) {
  return `
    <div class="admin-section-card">
      <h2>Skills</h2>
      ${field("Eyebrow", "eyebrow", d.eyebrow)}
      ${field("Heading",  "heading", d.heading)}
    </div>
    ${d.categories.map((cat, i) => `
      <div class="admin-section-card">
        <h2>${cat.title}</h2>
        ${field("Title", `categories.${i}.title`, cat.title)}
        ${tagField(`Skills`, `categories.${i}.items`, cat.items)}
      </div>`
    ).join("")}`;
}

function experienceEditor(d) {
  const cards = d.items.map((item, i) => `
    <div class="admin-section-card" data-item-index="${i}">
      <div class="admin-section-card-head">
        <h2>Role ${i + 1}</h2>
        <button type="button" class="admin-btn ghost" data-remove-item>Remove</button>
      </div>
      ${field("Date",        `items.${i}.date`,        item.date)}
      ${field("Title",       `items.${i}.title`,       item.title)}
      ${field("Description", `items.${i}.description`, item.description, true)}
      ${tagField("Tags", `items.${i}.tags`, item.tags)}
    </div>`
  ).join("");

  return `
    <div class="admin-list-editor" data-list-field="items" data-empty-item='${JSON.stringify(EMPTY_EXPERIENCE_ITEM)}'>
      <div class="admin-list-actions">
        <button type="button" class="admin-btn primary" data-add-item>+ Add Role</button>
      </div>
      ${cards}
    </div>`;
}

function credentialsEditor(d) {
  const cards = d.items.map((item, i) => `
    <div class="admin-section-card" data-item-index="${i}">
      <div class="admin-section-card-head">
        <h2>Credential ${i + 1}</h2>
        <button type="button" class="admin-btn ghost" data-remove-item>Remove</button>
      </div>
      ${field("Badge",    `items.${i}.badge`,    item.badge)}
      ${field("Title",    `items.${i}.title`,    item.title)}
      ${field("Subtitle", `items.${i}.subtitle`, item.subtitle)}
    </div>`
  ).join("");

  return `
    <div class="admin-list-editor" data-list-field="items" data-empty-item='${JSON.stringify(EMPTY_CREDENTIAL_ITEM)}'>
      <div class="admin-list-actions">
        <button type="button" class="admin-btn primary" data-add-item>+ Add Credential</button>
      </div>
      ${cards}
    </div>`;
}

function contactEditor(d) {
  return `
    <div class="admin-section-card">
      <h2>Contact</h2>
      ${field("Eyebrow",     "eyebrow",     d.eyebrow)}
      ${field("Heading",     "heading",     d.heading)}
      ${field("Description", "description", d.description, true)}
      ${field("Email",       "email",       d.email)}
      ${field("Phone",       "phone",       d.phone)}
    </div>`;
}

function genericEditor(d) {
  return `
    <div class="admin-section-card">
      <h2>Raw JSON</h2>
      <textarea class="admin-textarea" style="min-height:400px;font-family:monospace" readonly>${JSON.stringify(d, null, 2)}</textarea>
    </div>`;
}

// ── Reusable editor widgets ───────────────────────────────────────────────────
function field(label, fieldPath, value, multiline = false) {
  if (multiline) {
    return `
      <div class="admin-field">
        <label>${label}</label>
        <textarea class="admin-textarea" data-field="${fieldPath}">${escapeHtml(value ?? "")}</textarea>
      </div>`;
  }
  return `
    <div class="admin-field">
      <label>${label}</label>
      <input class="admin-input" type="text" data-field="${fieldPath}" value="${escapeHtml(value ?? "")}">
    </div>`;
}

function tagField(label, fieldPath, tags) {
  const tagItems = tags.map((t) => `
    <span class="admin-tag">
      <span data-tag-value>${escapeHtml(t)}</span>
      <button type="button" aria-label="Remove ${escapeHtml(t)}">×</button>
    </span>`
  ).join("");

  return `
    <div class="admin-field">
      <label>${label}</label>
      <div class="admin-tag-list" data-tag-field="${fieldPath}">${tagItems}</div>
      <div class="admin-row">
        <input class="admin-input" type="text" placeholder="Add tag…" data-tag-input>
        <button class="admin-btn ghost" type="button" data-tag-add>Add</button>
      </div>
    </div>`;
}

function imageField(label, fieldPath, value) {
  return `
    <div class="admin-field">
      <label>${label}</label>
      <div class="admin-image-upload" data-image-field="${fieldPath}">
        <img class="admin-image-preview" src="${escapeHtml(value ?? "")}" alt=""${value ? "" : ' style="display:none"'}>
        <input type="hidden" data-field="${fieldPath}" value="${escapeHtml(value ?? "")}">
        <label class="admin-btn ghost admin-upload-btn">
          Upload Image
          <input type="file" accept="image/*" hidden data-image-input>
        </label>
        <span class="admin-image-status" data-image-status></span>
      </div>
    </div>`;
}

function initTagEditors(container) {
  // Remove tag
  container.querySelectorAll(".admin-tag button").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".admin-tag").remove());
  });

  // Add tag
  container.querySelectorAll("[data-tag-add]").forEach((addBtn) => {
    const row      = addBtn.closest(".admin-row");
    const input    = row.querySelector("[data-tag-input]");
    const tagList  = row.previousElementSibling;

    function addTag() {
      const value = input.value.trim();
      if (!value) return;
      const tag = document.createElement("span");
      tag.className = "admin-tag";
      tag.innerHTML = `<span data-tag-value>${escapeHtml(value)}</span><button type="button" aria-label="Remove ${escapeHtml(value)}">×</button>`;
      tag.querySelector("button").addEventListener("click", () => tag.remove());
      tagList.appendChild(tag);
      input.value = "";
    }

    addBtn.addEventListener("click", addTag);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });
  });
}

function initImageUploads(container) {
  container.querySelectorAll("[data-image-field]").forEach((wrap) => {
    const fileInput = wrap.querySelector("[data-image-input]");
    const hiddenField = wrap.querySelector("[data-field]");
    const preview = wrap.querySelector(".admin-image-preview");
    const status = wrap.querySelector("[data-image-status]");

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      status.textContent = "Uploading…";
      try {
        const url = await uploadImage(file);
        hiddenField.value = url;
        preview.src = url;
        preview.style.display = "";
        status.textContent = "Uploaded.";
      } catch (err) {
        status.textContent = err.message || "Upload failed";
      } finally {
        fileInput.value = "";
        setTimeout(() => { status.textContent = ""; }, 3000);
      }
    });
  });
}

/** Add/remove buttons for array-of-objects sections (Experience, Credentials). */
function initListEditors(container) {
  container.querySelectorAll("[data-add-item]").forEach((btn) => {
    const listEl = btn.closest("[data-list-field]");
    btn.addEventListener("click", () => {
      const blank = JSON.parse(listEl.dataset.emptyItem);
      const data = collectEditorData();
      setAtPath(data, listEl.dataset.listField).push(blank);
      portfolioData[activeSection] = data;
      renderEditor();
    });
  });

  container.querySelectorAll("[data-remove-item]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("[data-item-index]");
      const listEl = card.closest("[data-list-field]");
      const index = Number(card.dataset.itemIndex);
      const data = collectEditorData();
      setAtPath(data, listEl.dataset.listField).splice(index, 1);
      portfolioData[activeSection] = data;
      renderEditor();
    });
  });
}

/** Resolves a dot-path (e.g. "items") against an object, returning the target array/value. */
function setAtPath(data, dotPath) {
  const path = dotPath.split(".");
  let obj = data;
  for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
  return obj[path[path.length - 1]];
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
init();
