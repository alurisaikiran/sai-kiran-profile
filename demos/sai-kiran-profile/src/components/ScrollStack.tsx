"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode[];
}

export default function ScrollStack({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const cards     = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!container || cards.length === 0) return;

    const STICKY_BASE = 96;
    const STACK_GAP   = 22;
    const SCALE_STEP  = 0.03;

    // Measure each card's natural scroll-position once
    let naturalTops: number[] = [];
    const measureNaturals = () => {
      naturalTops = cards.map((card) => {
        const cRect    = container.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        return cardRect.top - cRect.top + window.scrollY;
      });
    };
    measureNaturals();

    let raf: number;
    let lastY = -1;

    const update = () => {
      const sy = window.scrollY;
      if (Math.abs(sy - lastY) > 0.4) {
        lastY = sy;
        cards.forEach((card, i) => {
          const stickyTop  = STICKY_BASE + i * STACK_GAP;
          const naturalTop = naturalTops[i] - sy;

          if (naturalTop <= stickyTop) {
            // Card i is stuck. Scale it down proportional to how many
            // subsequent stuck cards are above it.
            const stackedAbove = cards.slice(i + 1).filter((_, k) => {
              const nat = naturalTops[i + 1 + k] - sy;
              return nat <= STICKY_BASE + (i + 1 + k) * STACK_GAP;
            }).length;

            const scale = Math.max(1 - stackedAbove * SCALE_STEP, 0.86);
            const blur  = stackedAbove * 0.6;
            card.style.transform = `translate3d(0,0,0) scale(${scale})`;
            card.style.filter    = blur > 0 ? `blur(${blur}px)` : "";
          } else {
            card.style.transform = "";
            card.style.filter    = "";
          }
        });
      }
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("resize", measureNaturals, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureNaturals);
    };
  }, []);

  return (
    <div ref={containerRef} className="scroll-stack">
      {Array.isArray(children) &&
        children.map((child, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="ss-card"
            style={{
              position:      "sticky",
              top:           `${96 + i * 22}px`,
              zIndex:        i + 1,
              marginBottom:  "28px",
              willChange:    "transform, filter",
              transformOrigin: "top center",
            }}
          >
            {child}
          </div>
        ))}
    </div>
  );
}
