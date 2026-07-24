export function renderStats(container, data) {
  const strip = document.createElement("section");
  strip.className = "stats-strip";
  strip.setAttribute("aria-label", "Profile highlights");
  strip.innerHTML = data.map(({ value, label }) =>
    `<div><strong>${value}</strong><span>${label}</span></div>`
  ).join("");
  container.appendChild(strip);
}
