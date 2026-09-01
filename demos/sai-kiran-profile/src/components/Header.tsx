"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "About",      href: "#about" },
  { label: "Skills",     href: "#skills" },
  { label: "Projects",   href: "#projects" },
  { label: "Launched",   href: "#launched" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
];

export default function Header() {
  const [open,      setOpen]      = useState(false);
  const [scrolled,  setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="site-header"
      id="top"
      style={scrolled ? { borderBottomColor: "rgba(212,175,55,0.22)" } : undefined}
    >
      <a className="brand" href="#top" aria-label="Sai Kiran Aluri home">
        <svg className="brand-logo" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" fill="none">
          <defs>
            <linearGradient id="sk-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8C547" />
              <stop offset="100%" stopColor="#B8962E" />
            </linearGradient>
            <filter id="sk-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx="24" cy="24" r="21.5" fill="rgba(212,175,55,0.07)" stroke="url(#sk-gold)" strokeWidth="1.4" />
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="0.6" />
          <text
            x="24" y="31"
            textAnchor="middle"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize="18"
            letterSpacing="2.5"
            fill="url(#sk-gold)"
            filter="url(#sk-glow)"
          >SK</text>
        </svg>
        <span className="brand-name">Sai Kiran Aluri</span>
      </a>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={`site-nav${open ? " open" : ""}`}
        id="site-nav"
        onClick={() => setOpen(false)}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <a key={href} href={href}>{label}</a>
        ))}
      </nav>
    </header>
  );
}
