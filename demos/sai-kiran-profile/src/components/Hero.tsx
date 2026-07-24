"use client";

import { useEffect, useState } from "react";
import AIBackground from "./AIBackground";
import type { HeroContent } from "@/lib/content-types";

const ROTATE_MS = 1800;

export default function Hero({ data }: { data: HeroContent }) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (data.roles.length < 2) return;
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % data.roles.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [data.roles.length]);

  return (
    <section className="hero" id="home">
      <AIBackground />
      <div className="hero-inner">
        <div className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.photo} alt={data.photoAlt} />
        </div>
        <p className="eyebrow">{data.eyebrow}</p>
        <h1>
          Hi, I&apos;m <span>{data.name}</span>
        </h1>
        <p className="role-line">
          I&apos;m a <strong id="roleText">{data.roles[roleIndex]}</strong>
        </p>
        <p className="hero-text">{data.description}</p>
        <div className="hero-actions">
          {data.actions.map(({ label, href, variant }) => (
            <a key={label} className={`button ${variant}`} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="social-row" aria-label="Profile links">
          {data.social.map(({ label, href, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
