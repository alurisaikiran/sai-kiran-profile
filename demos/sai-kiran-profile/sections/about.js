export function renderAbout(container, data) {
  const section = document.createElement("section");
  section.className = "section about";
  section.id = "about";
  section.innerHTML = buildAbout(data);
  container.appendChild(section);
}

function buildAbout(d) {
  const paras   = d.paragraphs.map((p) => `<p>${p}</p>`).join("");
  const actions = d.actions.map(({ label, href, variant }) =>
    `<a class="button ${variant}" href="${href}">${label}</a>`
  ).join("");
  const cards = d.cards.map(({ number, title, description }) => `
    <article>
      <span>${number}</span>
      <h3>${title}</h3>
      <p>${description}</p>
    </article>
  `).join("");

  return `
    <div class="section-heading">
      <p class="eyebrow">${d.eyebrow}</p>
      <h2>${d.heading}</h2>
    </div>
    <div class="about-layout">
      <div class="about-copy">
        ${paras}
        <div class="section-actions">${actions}</div>
      </div>
      <div class="about-cards">${cards}</div>
    </div>
  `;
}
