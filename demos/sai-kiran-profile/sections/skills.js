export function renderSkills(container, data) {
  const section = document.createElement("section");
  section.className = "section skills";
  section.id = "skills";
  section.innerHTML = buildSkills(data);
  container.appendChild(section);
  initFlipCards(section);
}

function buildSkills(d) {
  const actions = d.actions.map(({ label, href, variant }) =>
    `<a class="button ${variant}" href="${href}">${label}</a>`
  ).join("");

  const cards = d.categories.map(({ title, flip, wide, items }) => {
    const wideClass = wide ? " wide" : "";
    const pills = items.map((item) => `<span>${item}</span>`).join("");

    if (flip) {
      return `
        <article class="skill-card flip-card${wideClass}" tabindex="0" data-flip-card aria-label="${title} skills">
          <div class="skill-flip">
            <div class="skill-face skill-front"><h3>${title}</h3></div>
            <div class="skill-face skill-back">
              <h3>${title}</h3>
              <div class="skill-list">${pills}</div>
            </div>
          </div>
        </article>`;
    }

    return `
      <article class="skill-card${wideClass}">
        <h3>${title}</h3>
        <div class="skill-list">${pills}</div>
      </article>`;
  }).join("");

  return `
    <div class="section-heading center">
      <p class="eyebrow">${d.eyebrow}</p>
      <h2>${d.heading}</h2>
      <div class="section-actions centered">${actions}</div>
    </div>
    <div class="skills-grid">${cards}</div>
  `;
}

function initFlipCards(container) {
  const cards = container.querySelectorAll("[data-flip-card]");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => { if (c !== card) c.classList.remove("is-flipped"); });
      card.classList.toggle("is-flipped");
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
      if (e.key === "Escape") card.classList.remove("is-flipped");
    });
  });
}
