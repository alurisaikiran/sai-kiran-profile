import type { ProjectsContent } from "@/lib/content-types";

export default function Projects({ data }: { data: ProjectsContent }) {
  const f = data.featured;

  return (
    <section className="section projects" id="projects">
      <div className="project-grid">
        {/* Featured card — full-width, two-column internally */}
        <article className="project-card featured motion-item" key="featured">
          <div className="featured-content">
            <div className="project-top">
              <span>{f.badge}</span>
              <a href={f.href} target="_blank" rel="noopener">Open ↗</a>
            </div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
            <div className="mini-tags">
              {f.tags.map((t) => <span key={t}>{t}</span>)}
            </div>
          </div>
          <div className="browser-preview" aria-label={`${f.browserUrl} preview`}>
            <div className="browser-bar">
              <span /><span /><span />
              <strong>{f.browserUrl}</strong>
            </div>
            <div className="browser-screen">
              <p>{f.browserSubline}</p>
              <h3>{f.browserHeadline}</h3>
              <div className="preview-pill-row">
                {f.browserPills.map((p) => <span key={p}>{p}</span>)}
              </div>
            </div>
          </div>
        </article>

        {/* Regular project cards */}
        {data.cards.map(({ badge, title, description, tags }) => (
          <article className="project-card motion-item" key={title}>
            <div className="project-top"><span>{badge}</span></div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="mini-tags">{tags.map((t) => <span key={t}>{t}</span>)}</div>
          </article>
        ))}
      </div>

      {/* Demo gallery */}
      <div className="demo-showcase">
        <div className="demo-heading">
          <p className="eyebrow">{data.demos.eyebrow}</p>
          <h3>{data.demos.heading}</h3>
        </div>
        <div className="demo-grid">
          {data.demos.items.map(({ href, image, imageAlt, badge, title, description, cta }) => (
            <a className="demo-card motion-item" href={href} target="_blank" rel="noopener" key={title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={imageAlt} />
              <div>
                <span>{badge}</span>
                <h4>{title}</h4>
                <p>{description}</p>
                <strong>{cta} ↗</strong>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
