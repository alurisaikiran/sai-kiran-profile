export function renderProjects(container, data) {
  const section = document.createElement("section");
  section.className = "section projects";
  section.id = "projects";
  section.innerHTML = buildProjects(data);
  container.appendChild(section);
}

function buildProjects(d) {
  const actions = d.actions.map(({ label, href, variant, external }) =>
    `<a class="button ${variant}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`
  ).join("");

  const f = d.featured;
  const featuredPills = f.browserPills.map((p) => `<span>${p}</span>`).join("");
  const featuredTags  = f.tags.map((t) => `<span>${t}</span>`).join("");

  const extraCards = d.cards.map(({ badge, title, description, tags }) => {
    const tagPills = tags.map((t) => `<span>${t}</span>`).join("");
    return `
      <article class="project-card">
        <div class="project-top"><span>${badge}</span></div>
        <h3>${title}</h3>
        <p>${description}</p>
        <div class="mini-tags">${tagPills}</div>
      </article>`;
  }).join("");

  const demos = buildDemos(d.demos);

  return `
    <div class="section-heading center">
      <p class="eyebrow">${d.eyebrow}</p>
      <h2>${d.heading}</h2>
      <div class="section-actions centered">${actions}</div>
    </div>
    <div class="project-grid">
      <article class="project-card featured startlearning-card">
        <div class="project-top">
          <span>${f.badge}</span>
          <a href="${f.href}" target="_blank" rel="noopener">Open</a>
        </div>
        <div class="browser-preview" aria-label="${f.browserUrl} preview">
          <div class="browser-bar">
            <span></span><span></span><span></span>
            <strong>${f.browserUrl}</strong>
          </div>
          <div class="browser-screen">
            <p>${f.browserSubline}</p>
            <h3>${f.browserHeadline}</h3>
            <div class="preview-pill-row">${featuredPills}</div>
          </div>
        </div>
        <div>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
          <div class="mini-tags">${featuredTags}</div>
        </div>
      </article>
      ${extraCards}
    </div>
    ${demos}
  `;
}

function buildDemos(d) {
  const items = d.items.map(({ href, image, imageAlt, badge, title, description, cta, featured: isFeatured }) => `
    <a class="demo-card" href="${href}" target="_blank" rel="noopener">
      <img src="${image}" alt="${imageAlt}">
      <div>
        <span>${badge}</span>
        <h4>${title}</h4>
        <p>${description}</p>
        <strong>${cta}</strong>
      </div>
    </a>`
  ).join("");

  return `
    <div class="demo-showcase">
      <div class="demo-heading">
        <p class="eyebrow">${d.eyebrow}</p>
        <h3>${d.heading}</h3>
      </div>
      <div class="demo-grid">${items}</div>
    </div>`;
}
