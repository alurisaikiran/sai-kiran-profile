import { initRoleRotator } from "../utils/animations.js";

export function renderHero(container, data) {
  const section = document.createElement("section");
  section.className = "hero";
  section.id = "home";
  section.innerHTML = buildHero(data);
  container.appendChild(section);
  initRoleRotator(section.querySelector("#roleText"), data.roles);
}

function buildHero(d) {
  const actions = d.actions.map(({ label, href, variant }) =>
    `<a class="button ${variant}" href="${href}">${label}</a>`
  ).join("");

  const social = d.social.map(({ label, href, external }) =>
    `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`
  ).join("");

  return `
    <canvas class="ai-bg" id="ai-bg" aria-hidden="true"></canvas>
    <div class="hero-inner">
      <div class="hero-photo">
        <img src="${d.photo}" alt="${d.photoAlt}">
      </div>
      <p class="eyebrow">${d.eyebrow}</p>
      <h1>Hi, I'm <span>${d.name}</span></h1>
      <p class="role-line">I'm a <strong id="roleText">${d.roles[0]}</strong></p>
      <p class="hero-text">${d.description}</p>
      <div class="hero-actions">${actions}</div>
      <div class="social-row" aria-label="Profile links">${social}</div>
    </div>
  `;
}
