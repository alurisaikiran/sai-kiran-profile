"use client";

import { useEffect, useRef } from "react";

/** Right-panel photo with subtle mouse parallax */
export default function HeroBackground() {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf: number;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) *  6;
    };

    const tick = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      img.style.transform = `scale(1.06) translate(${cx * 0.35}px, ${cy * 0.35}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-photo-panel">
      <div ref={imgRef} className="hero-photo-img" />
      <div className="hero-photo-fade" />
    </div>
  );
}
