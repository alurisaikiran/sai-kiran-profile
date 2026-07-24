/** Sticky nav header with mobile hamburger toggle. */

const NAV_LINKS = [
  { label: "About",      href: "#about" },
  { label: "Skills",     href: "#skills" },
  { label: "Projects",   href: "#projects" },
  { label: "Launched",   href: "#launched" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
];

export function renderHeader(container) {
  const header = document.createElement("header");
  header.className = "site-header";
  header.id = "top";
  header.innerHTML = buildHeader();
  container.prepend(header);
  initMobileNav(header);
}

function buildHeader() {
  const links = NAV_LINKS.map(({ label, href }) => `<a href="${href}">${label}</a>`).join("");
  return `
    <a class="brand" href="#top" aria-label="Sai Kiran Aluri home">
      <span class="brand-mark">SK</span>
      <span>Sai Kiran Aluri</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" id="site-nav">${links}</nav>
  `;
}

function initMobileNav(header) {
  const toggle = header.querySelector(".nav-toggle");
  const nav    = header.querySelector(".site-nav");

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav?.addEventListener("click", (e) => {
    if (e.target.matches("a")) {
      nav.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
}
