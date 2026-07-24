"use client";

import { useEffect } from "react";

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

/** Fades sections in as they scroll into view. */
export function useScrollReveal() {
  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);
}
