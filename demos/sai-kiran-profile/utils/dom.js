/**
 * Minimal DOM helpers.
 * Using a tagged template literal keeps section render functions readable
 * without adding a framework dependency.
 */

/**
 * Tagged template for building HTML strings safely.
 * Values are auto-escaped unless wrapped in raw().
 */
export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const val = values[i];
    if (val === undefined || val === null || val === false) return acc + str;
    if (val instanceof RawHTML) return acc + str + val.value;
    return acc + str + escapeHtml(String(val));
  }, "");
}

/** Mark a value as already-safe HTML so html`` won't escape it. */
export function raw(value) {
  return new RawHTML(value);
}

class RawHTML {
  constructor(value) { this.value = value; }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Render an array of items with a template function, joined with no separator. */
export function each(items, fn) {
  return raw(items.map(fn).join(""));
}

/** Build a space-separated class string, filtering out falsy values. */
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Render an action button/link. */
export function renderButton({ label, href, variant = "primary", external = false }) {
  const ext = external ? ' target="_blank" rel="noopener"' : "";
  return html`<a class="button ${raw(variant)}" href="${href}"${raw(ext)}>${label}</a>`;
}
