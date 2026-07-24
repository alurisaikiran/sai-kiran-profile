"use client";

import { useState } from "react";
import type { SkillsContent } from "@/lib/content-types";

export default function Skills({ data }: { data: SkillsContent }) {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <section className="section skills" id="skills">
      <div className="section-heading center">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2>{data.heading}</h2>
        <div className="section-actions centered">
          {data.actions.map(({ label, href, variant }) => (
            <a key={label} className={`button ${variant}`} href={href}>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="skills-grid">
        {data.categories.map(({ title, flip, wide, items }) => {
          const wideClass = wide ? " wide" : "";
          const pills = items.map((item) => <span key={item}>{item}</span>);

          if (!flip) {
            return (
              <article key={title} className={`skill-card${wideClass}`}>
                <h3>{title}</h3>
                <div className="skill-list">{pills}</div>
              </article>
            );
          }

          const isFlipped = flipped === title;
          return (
            <article
              key={title}
              className={`skill-card flip-card${wideClass}${isFlipped ? " is-flipped" : ""}`}
              tabIndex={0}
              aria-label={`${title} skills`}
              onClick={() => setFlipped(isFlipped ? null : title)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFlipped(isFlipped ? null : title);
                }
                if (e.key === "Escape") setFlipped(null);
              }}
            >
              <div className="skill-flip">
                <div className="skill-face skill-front">
                  <h3>{title}</h3>
                </div>
                <div className="skill-face skill-back">
                  <h3>{title}</h3>
                  <div className="skill-list">{pills}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
