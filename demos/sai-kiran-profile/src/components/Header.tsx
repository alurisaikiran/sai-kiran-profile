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
        <span className="brand-mark">SK</span>
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
