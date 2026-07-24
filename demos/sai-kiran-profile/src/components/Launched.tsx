import type { LaunchedContent } from "@/lib/content-types";

export default function Launched({ data }: { data: LaunchedContent }) {
  return (
    <section className="section launched" id="launched">
      <div className="launched-inner">
        <div className="launched-copy">
          <span className="live-badge">
            <span className="live-dot" /> {data.badge}
          </span>
          <p className="eyebrow">{data.eyebrow}</p>
          <h2>
            {data.heading}{" "}
            <a href={data.headingLink.href} target="_blank" rel="noopener">
              {data.headingLink.label}
            </a>
            .
          </h2>
          <p>{data.description}</p>
          <ul className="launched-highlights">
            {data.highlights.map(({ title, description }) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{description}</span>
              </li>
            ))}
          </ul>
          <div className="launched-tags mini-tags">
            {data.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="launched-actions">
            {data.actions.map(({ label, href, variant, external }) => (
              <a
                key={label}
                className={`button ${variant}`}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="launched-preview" aria-label={`${data.preview.url} live site preview`}>
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <strong>{data.preview.url}</strong>
          </div>
          <a className="launched-shot" href={data.preview.href} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.preview.image} alt={data.preview.imageAlt} />
          </a>
          <div className="launched-meta">
            {data.preview.meta.map(({ label, value, highlight }) => (
              <div key={label}>
                <strong>{label}</strong>
                <span className={highlight ? "status-live" : undefined}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
