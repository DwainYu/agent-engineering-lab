import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Card, StatusPill } from "../components/ui/Primitives";
import { experiments } from "../lib/content";
import { excerpt } from "../lib/markdown";

export function ExperimentsPage() {
  return (
    <PageContainer
      title="Experiments"
      description="One experiment per directory in experiments/. The README holds the lab notebook; the runnable code lives in the training repository."
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {experiments.length} experiments
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {experiments.map((experiment) => (
          <Link
            key={experiment.id}
            to={`/experiments/${experiment.id}`}
            className="block"
          >
            <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                  Experiment #{String(experiment.number).padStart(3, "0")}
                </span>
                <StatusPill status={experiment.status} showGlyph={false} />
              </div>
              <h2 className="mt-2 text-[15px] font-medium text-[var(--text)]">
                {experiment.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[var(--dim)]">
                {experiment.summary ?? excerpt(experiment.body, 170)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] text-[var(--faint)]">
                {experiment.language.map((language) => (
                  <span
                    key={language}
                    className="rounded border border-[var(--line)] px-1.5 py-0.5"
                  >
                    {language}
                  </span>
                ))}
                {experiment.day != null && (
                  <span className="rounded border border-[var(--line)] px-1.5 py-0.5">
                    Day {String(experiment.day).padStart(2, "0")}
                  </span>
                )}
                {experiment.trainingProject && (
                  <span className="rounded border border-[var(--line)] px-1.5 py-0.5">
                    {experiment.trainingProject.repo}
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
