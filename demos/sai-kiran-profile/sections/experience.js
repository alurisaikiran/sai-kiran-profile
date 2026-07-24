export function renderExperience(container, data) {
  const section = document.createElement("section");
  section.className = "section experience";
  section.id = "experience";
  section.innerHTML = buildExperience(data);
  container.appendChild(section);
}

function buildExperience(d) {
  const actions = d.actions.map(({ label, href, variant }) =>
    `<a class="button ${variant}" href="${href}">${label}</a>`
  ).join("");

  const items = d.items.map(({ date, title, description, tags }) => {
    const tagPills = tags.map((t) => `<span>${t}</span>`).join("");
    return `
      <article class="timeline-item">
        <span class="timeline-date">${date}</span>
        <div>
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="mini-tags">${tagPills}</div>
        </div>
      </article>`;
  }).join("");

  return `
    <div class="section-heading">
      <p class="eyebrow">${d.eyebrow}</p>
      <div>
        <h2>${d.heading}</h2>
        <div class="section-actions">${actions}</div>
      </div>
    </div>
    <div class="timeline">${items}</div>
  `;
}
