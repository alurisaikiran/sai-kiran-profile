import type { StatsContent } from "@/lib/content-types";

export default function Stats({ data }: { data: StatsContent }) {
  return (
    <section className="stats-strip" aria-label="Profile highlights">
      {data.map(({ value, label }) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
