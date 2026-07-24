export function renderLaunched(container, data) {
  const section = document.createElement("section");
  section.className = "section launched";
  section.id = "launched";
  section.innerHTML = buildLaunched(data);
  container.appendChild(section);
}

function buildLaunched(d) {
  const highlights = d.highlights.map(({ title, description }) => `
    <li><strong>${title}</strong><span>${description}</span></li>`
  ).join("");

  const tags = d.tags.map((t) => `<span>${t}</span>`).join("");

  const actions = d.actions.map(({ label, href, variant, external }) =>
    `<a class="button ${variant}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`
  ).join("");

  const metaItems = d.preview.meta.map(({ label, value, highlight }) => `
    <div>
      <strong>${label}</strong>
      <span${highlight ? ' class="status-live"' : ""}>${value}</span>
    </div>`
  ).join("");

  return `
    <div class="launched-inner">
      <div class="launched-copy">
        <span class="live-badge"><span class="live-dot"></span> ${d.badge}</span>
        <p class="eyebrow">${d.eyebrow}</p>
        <h2>${d.heading} <a href="${d.headingLink.href}" target="_blank" rel="noopener">${d.headingLink.label}</a>.</h2>
        <p>${d.description}</p>
        <ul class="launched-highlights">${highlights}</ul>
        <div class="launched-tags mini-tags">${tags}</div>
        <div class="launched-actions">${actions}</div>
      </div>
      <div class="launched-preview" aria-label="${d.preview.url} live site preview">
        <div class="browser-bar">
          <span></span><span></span><span></span>
          <strong>${d.preview.url}</strong>
        </div>
        <a class="launched-shot" href="${d.preview.href}" target="_blank" rel="noopener">
          <img src="${d.preview.image}" alt="${d.preview.imageAlt}">
        </a>
        <div class="launched-meta">${metaItems}</div>
      </div>
    </div>
  `;
}
