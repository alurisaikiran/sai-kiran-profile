/** Site footer. */

export function renderFooter(container) {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <span>© 2026 · Sai Kiran Aluri</span>
    <a href="#top">Back to top</a>
  `;
  container.appendChild(footer);
}
