import { useMemo, useState } from "react";
import { docsFor, phaseName, progress } from "../lib/content";
import { useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { statusLabel } from "../lib/status";
import { DayCard } from "../components/learning/DayCard";
import { EmptyState } from "../components/ui/Primitives";
import { PageContainer } from "../components/layout/Layout";

const FILTERS = ["all", "completed", "learning", "planned"] as const;
type Filter = (typeof FILTERS)[number];

export function LearnPage() {
  const { language } = useLanguage();

  const [filter, setFilter] = useState<Filter>("all");
  const [phase, setPhase] = useState<string>("all");

  // The reader asked for a language; the list, the titles and the counts all
  // answer from that tree — never from the English source.
  const list = docsFor(language).days;
  const phases = useMemo(() => [...new Set(list.map((day) => day.phase))].sort(), [list]);

  const visible = list.filter(
    (day) =>
      (filter === "all" || day.status === filter) &&
      (phase === "all" || day.phase === phase),
  );

  return (
    <PageContainer
      title={t(language, "learn.title")}
      description={t(language, "learn.description")}
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {t(language, "label.days", { count: list.length })} ·{" "}
          {t(language, "learn.complete", { percent: progress.summary.completionRate })}
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
          aria-label={t(language, "learn.filterPhase")}
        >
          <option value="all">{t(language, "learn.allPhases")}</option>
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
            title={t(language, "learn.noMatch")}
            description={t(language, "learn.noMatchBody")}
          />
        )}
      </div>
    </PageContainer>
  );
}
