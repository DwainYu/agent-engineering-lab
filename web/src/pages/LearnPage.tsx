import { useMemo, useState } from "react";
import { days, phaseName, progress } from "../lib/content";
import { statusLabel } from "../lib/status";
import { DayCard } from "../components/learning/DayCard";
import { EmptyState } from "../components/ui/Primitives";
import { PageContainer } from "../components/layout/Layout";

const FILTERS = ["all", "completed", "learning", "planned"] as const;
type Filter = (typeof FILTERS)[number];

export function LearnPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [phase, setPhase] = useState<string>("all");

  const phases = useMemo(() => [...new Set(days.map((day) => day.phase))].sort(), []);

  const visible = days.filter(
    (day) =>
      (filter === "all" || day.status === filter) &&
      (phase === "all" || day.phase === phase),
  );

  return (
    <PageContainer
      title="Learning"
      description="Every unit of study is one Markdown file in docs/daily/. The list you see is generated from them — adding a day needs no code change."
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {days.length} days · {progress.summary.completionRate}% complete
        </span>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-md border px-3 py-1 font-mono text-[11px] transition-colors ${
              filter === option
                ? "border-[var(--accent)]/50 bg-[var(--elevate)] text-[var(--text)]"
                : "border-[var(--line)] text-[var(--faint)] hover:text-[var(--text)]"
            }`}
          >
            {option === "all" ? "All" : statusLabel[option]}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-[var(--line)]" />
        <select
          value={phase}
          onChange={(event) => setPhase(event.target.value)}
          className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] text-[var(--dim)]"
          aria-label="Filter by phase"
        >
          <option value="all">All phases</option>
          {phases.map((id) => (
            <option key={id} value={id}>
              {phaseName(id)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {visible.map((day) => (
          <DayCard key={day.slug} day={day} />
        ))}
        {visible.length === 0 && (
          <EmptyState
            title="No days match this filter"
            description="Clear the status or phase filter to see the rest of the timeline."
          />
        )}
      </div>
    </PageContainer>
  );
}
