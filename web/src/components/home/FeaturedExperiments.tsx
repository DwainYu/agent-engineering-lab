import { Link } from "react-router-dom";
import { experiments } from "../../lib/content";
import { excerpt } from "../../lib/markdown";
import { StatusPill } from "../ui/Primitives";

const RANK = { completed: 0, learning: 1, planned: 2 } as const;

export function FeaturedExperiments({ count = 3 }: { count?: number }) {
  const items = experiments
    .slice()
    .sort((a, b) => RANK[a.status] - RANK[b.status] || a.number - b.number)
    .slice(0, count);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
          Featured experiments
        </h2>
        <Link
          to="/experiments"
          className="text-xs text-[var(--faint)] hover:text-[var(--text)]"
        >
          all experiments →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((experiment) => (
          <Link
            key={experiment.id}
            to={`/experiments/${experiment.id}`}
            className="group flex flex-col rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]/40"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--faint)]">
                #{String(experiment.number).padStart(3, "0")}
              </span>
              <StatusPill status={experiment.status} showGlyph={false} />
            </div>
            <h3 className="mt-2 text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)]">
              {experiment.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-[var(--dim)]">
              {excerpt(experiment.body, 150)}
            </p>
            {experiment.language.length > 0 && (
              <p className="mt-auto pt-3 font-mono text-[11px] text-[var(--faint)]">
                {experiment.language.join(" / ")}
              </p>
            )}
          </Link>
        ))}
        {items.length === 0 && (
          <p className="font-mono text-[12px] text-[var(--faint)]">
            No experiments recorded yet.
          </p>
        )}
      </div>
    </section>
  );
}
