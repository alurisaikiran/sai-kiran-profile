export function renderCredentials(container, data) {
  const section = document.createElement("section");
  section.className = "section credentials";
  section.id = "credentials";
  section.innerHTML = buildCredentials(data);
  container.appendChild(section);
}

function buildCredentials(d) {
  const actions = d.actions.map(({ label, href, variant }) =>
    `<a class="button ${variant}" href="${href}">${label}</a>`
  ).join("");

  const items = d.items.map(({ badge, title, subtitle }) => `
    <article>
      <span>${badge}</span>
      <h3>${title}</h3>
      <p>${subtitle}</p>
    </article>`
  ).join("");

  return `
    <div class="section-heading">
      <p class="eyebrow">${d.eyebrow}</p>
      <div>
        <h2>${d.heading}</h2>
        <div class="section-actions">${actions}</div>
      </div>
    </div>
    <div class="credential-grid">${items}</div>
  `;
}
