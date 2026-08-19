"use client";

import { useRef, useCallback } from "react";

interface Props {
  src: string;
  alt: string;
}

export default function Portrait3DCard({ src, alt }: Props) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const spotRef  = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const spot = spotRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width;
    const y    = (e.clientY - rect.top)  / rect.height;
    const rotY =  (x - 0.5) * 18;
    const rotX = -(y - 0.5) * 18;

    card.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    if (spot) {
      spot.style.setProperty("--mx", `${x * 100}%`);
      spot.style.setProperty("--my", `${y * 100}%`);
    }
  }, []);

  const onLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1100px) rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  return (
    <div className="portrait-card-wrap">
      <div
        ref={cardRef}
        className="portrait-card"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ transition: "transform 0.08s ease, box-shadow 0.3s ease" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />

        <div className="portrait-bracket tl" />
        <div className="portrait-bracket tr" />
        <div className="portrait-bracket bl" />
        <div className="portrait-bracket br" />

        <div ref={spotRef} className="portrait-spotlight" />
        <div className="portrait-laser" />
      </div>
    </div>
  );
}
