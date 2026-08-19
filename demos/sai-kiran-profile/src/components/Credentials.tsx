import type { CredentialsContent } from "@/lib/content-types";

export default function Credentials({ data }: { data: CredentialsContent }) {
  return (
    <section className="section credentials" id="credentials">
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

      <div className="credential-grid">
        {data.items.map(({ badge, title, subtitle }, i) => (
          <article key={`${title}-${i}`} className="motion-item">
            <span>{badge}</span>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
