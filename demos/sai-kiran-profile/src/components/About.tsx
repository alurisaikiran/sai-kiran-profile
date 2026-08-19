import Portrait3DCard from "./Portrait3DCard";
import type { AboutContent } from "@/lib/content-types";

export default function About({ data }: { data: AboutContent }) {
  return (
    <section className="section about" id="about">
      <div className="about-layout">
        {/* Left — heading + text + cards */}
        <div className="about-text-col">
          <div className="section-heading">
            <p className="eyebrow">{data.eyebrow}</p>
            <h2>{data.heading}</h2>
          </div>

          <div className="about-copy motion-item">
            <p className="about-headline">
              I DON&apos;T JUST WRITE CODE.{" "}
              <em>I BUILD WHAT&apos;S NEXT.</em>
            </p>
            {data.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="section-actions">
              {data.actions.map(({ label, href, variant }) => (
                <a key={label} className={`button ${variant}`} href={href}>{label}</a>
              ))}
            </div>
            <div className="about-cards">
              {data.cards.map(({ number, title, description }) => (
                <article key={number} className="motion-item">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Right on desktop / top on mobile — 3D portrait */}
        <div className="about-portrait">
          <Portrait3DCard src="/assets/profile.png" alt="Sai Kiran Aluri" />
        </div>
      </div>
    </section>
  );
}
