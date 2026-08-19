"use client";

import { useEffect, useState } from "react";
import HeroBackground from "./HeroBackground";
import AIBackground   from "./AIBackground";
import type { HeroContent } from "@/lib/content-types";

const ROTATE_MS = 2200;

export default function Hero({ data }: { data: HeroContent }) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (data.roles.length < 2) return;
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % data.roles.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [data.roles.length]);

  return (
    <section className="hero" id="home">
      <AIBackground />
      <HeroBackground />

      <div className="hero-glow-a" />
      <div className="hero-glow-b" />

      <div className="hero-inner">
        <div className="hero-eyebrow-row hero-reveal" style={{ animationDelay: "0.1s" }}>
          <span className="hero-eyebrow-line" />
          <p className="eyebrow" style={{ margin: 0 }}>{data.eyebrow}</p>
        </div>

        <h1 className="hero-reveal" style={{ animationDelay: "0.22s" }}>
          <span className="hero-name">{data.name}</span>
        </h1>

        <div className="hero-divider hero-reveal" style={{ animationDelay: "0.32s" }} />

        <p className="role-line hero-reveal" style={{ animationDelay: "0.4s" }}>
          I&apos;m a <strong key={roleIndex}>{data.roles[roleIndex]}</strong>
        </p>

        <p className="hero-text hero-reveal" style={{ animationDelay: "0.5s" }}>
          {data.description}
        </p>

        <div className="hero-actions hero-reveal" style={{ animationDelay: "0.6s" }}>
          {data.actions.map(({ label, href, variant }) => (
            <a key={label} className={`button ${variant}`} href={href}>{label}</a>
          ))}
        </div>

        <div className="social-row hero-reveal" aria-label="Profile links" style={{ animationDelay: "0.7s" }}>
          {data.social.map(({ label, href, external }) => (
            <a key={label} href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="hero-scroll-cue" aria-hidden="true">
        <span className="scroll-cue-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
