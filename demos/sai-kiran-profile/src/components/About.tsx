import type { AboutContent } from "@/lib/content-types";

export default function About({ data }: { data: AboutContent }) {
  return (
    <section className="section about" id="about">
      <div className="section-heading">
        <p className="eyebrow">{data.eyebrow}</p>
        <h2>{data.heading}</h2>
      </div>
      <div className="about-layout">
        <div className="about-copy">
          {data.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="section-actions">
            {data.actions.map(({ label, href, variant }) => (
              <a key={label} className={`button ${variant}`} href={href}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="about-cards">
          {data.cards.map(({ number, title, description }) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
