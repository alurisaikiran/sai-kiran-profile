import type { ExperienceContent } from "@/lib/content-types";

export default function Experience({ data }: { data: ExperienceContent }) {
  return (
    <section className="section experience" id="experience">
      <div className="section-heading">
        <p className="eyebrow motion-item">{data.eyebrow}</p>
        <div className="motion-item">
          <h2>{data.heading}</h2>
          <div className="section-actions">
            {data.actions.map(({ label, href, variant }) => (
              <a key={label} className={`button ${variant}`} href={href}>{label}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="timeline">
        {data.items.map(({ date, title, description, tags }, i) => (
          <article className="timeline-item motion-item" key={`${title}-${i}`}>
            <span className="timeline-date">{date}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="mini-tags">
                {tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
