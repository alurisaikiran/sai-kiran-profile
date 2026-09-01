import type { LaunchedSectionContent } from "@/lib/content-types";

export default function Launched({ data }: { data: LaunchedSectionContent }) {
  return (
    <>
      {data.map((item, idx) => (
        <section
          key={idx}
          className="section launched"
          {...(idx === 0 ? { id: "launched" } : {})}
        >
          <div className="launched-inner">
            <div className="launched-copy">
              <span className="live-badge">
                <span className="live-dot" /> {item.badge}
              </span>
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>
                {item.heading}{" "}
                <a href={item.headingLink.href} target="_blank" rel="noopener">
                  {item.headingLink.label}
                </a>
                .
              </h2>
              <p>{item.description}</p>
              <ul className="launched-highlights">
                {item.highlights.map(({ title, description }) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </li>
                ))}
              </ul>
              <div className="launched-tags mini-tags">
                {item.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="launched-actions">
                {item.actions.map(({ label, href, variant, external }) => (
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
            <div className="launched-preview" aria-label={`${item.preview.url} live site preview`}>
              <div className="browser-bar">
                <span />
                <span />
                <span />
                <strong>{item.preview.url}</strong>
              </div>
              <a className="launched-shot" href={item.preview.href} target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview.image} alt={item.preview.imageAlt} />
              </a>
              <div className="launched-meta">
                {item.preview.meta.map(({ label, value, highlight }) => (
                  <div key={label}>
                    <strong>{label}</strong>
                    <span className={highlight ? "status-live" : undefined}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
