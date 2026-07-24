/**
 * Scroll-reveal observer and role-text rotator.
 * Both are decoupled from specific section markup —
 * they work on any element with the right class.
 */

const REVEAL_SELECTOR = [
  ".section-heading",
  ".about-copy",
  ".about-cards article",
  ".skill-card",
  ".project-card",
  ".demo-card",
  ".timeline-item",
  ".credential-grid article",
  ".contact-panel",
  ".contact-form",
].join(", ");

/** Add the motion-item class and observe every matching element. */
export function initScrollReveal() {
  const items = document.querySelectorAll(REVEAL_SELECTOR);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((el) => {
    el.classList.add("motion-item");
    observer.observe(el);
  });
}

/**
 * Cycles through role strings on the given element.
 * @param {HTMLElement} el  - The element whose textContent will be replaced.
 * @param {string[]} roles  - Array of role strings to cycle through.
 * @param {number} interval - Milliseconds between each swap (default 1800).
 */
export function initRoleRotator(el, roles, interval = 1800) {
  if (!el || !roles.length) return;
  let index = 0;
  setInterval(() => {
    index = (index + 1) % roles.length;
    el.textContent = roles[index];
  }, interval);
}
