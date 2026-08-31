import type { CredentialsContent } from "@/lib/content-types";

export default function Credentials({ data }: { data: CredentialsContent }) {
  return (
    <section className="section credentials" id="credentials">
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
