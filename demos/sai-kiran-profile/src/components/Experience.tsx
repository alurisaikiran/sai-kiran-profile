'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { ExperienceContent, ExperienceItem } from '@/lib/content-types';

function splitTitle(title: string): { role: string; company: string } {
  const idx = title.indexOf('·');
  if (idx === -1) return { role: title.trim(), company: '' };
  return {
    role: title.slice(0, idx).trim(),
    company: title.slice(idx + 1).trim(),
  };
}

function Card({
  item,
  index,
  total,
  wrapRef,
}: {
  item: ExperienceItem;
  index: number;
  total: number;
  wrapRef: React.RefObject<HTMLDivElement>;
}) {
  // Track the shared wrap container's scroll progress
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  // Each card scales from 1 → targetScale over its portion of the scroll
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const rangeStart = index / total;
  const rangeEnd = (index + 1) / total;
  const scale = useTransform(scrollYProgress, [rangeStart, rangeEnd], [1, targetScale]);

  const { role, company } = splitTitle(item.title);
  const num = String(index + 1).padStart(2, '0');

  return (
    // Sticky wrapper — no transform here so position:sticky works
    <div
      className="exp-card-sticky"
      style={{ top: 88, zIndex: index + 1 }}
    >
      {/* Scale on a child so it doesn't interfere with sticky */}
      <motion.div style={{ scale, transformOrigin: 'top center' }}>
        <div className="exp-card">

          {/* ── Top row: giant number | company / role / date ── */}
          <div className="exp-card-top">
            <span className="exp-num">{num}</span>
            <div className="exp-card-meta">
              <p className="exp-date">{item.date}</p>
              <h3 className="exp-company">{company || role}</h3>
              {company && <p className="exp-role">{role}</p>}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="exp-divider" />

          {/* ── Description ── */}
          <p className="exp-desc">{item.description}</p>

          {/* ── Tech tags ── */}
          <div className="exp-tags">
            {item.tags.map((tag) => (
              <span key={tag} className="exp-tag">{tag}</span>
            ))}
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function Experience({ data }: { data: ExperienceContent }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const total = data.items.length;

  return (
    <section id="experience" className="exp-section">

      {/* ── Heading ── */}
      <div className="exp-heading-wrap">
        <p className="exp-eyebrow">{data.eyebrow}</p>
        <h2 className="exp-title">Experience</h2>
      </div>

      {/* ── Single scroll container — all sticky cards share it ── */}
      <div ref={wrapRef} className="exp-cards-wrap">
        {data.items.map((item, i) => (
          <Card
            key={`${item.title}-${i}`}
            item={item}
            index={i}
            total={total}
            wrapRef={wrapRef}
          />
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="exp-actions">
        {data.actions.map(({ label, href, variant }) => (
          <a key={label} href={href} className={`button ${variant}`}>
            {label}
          </a>
        ))}
      </div>

    </section>
  );
}
