import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Heatmap } from "../components/progress/Heatmap";
import { Card, EmptyState, ProgressBar, SectionTitle } from "../components/ui/Primitives";
import {
  comparisons,
  conceptById,
  concepts,
  days,
  experiments,
  progress,
  site,
  summary,
} from "../lib/content";
import { repoFileUrl } from "../lib/paths";
import { statusLabel } from "../lib/status";

function CountCard({ prefix }: { prefix: "days" | "concepts" | "experiments" }) {
  const total =
    prefix === "days"
      ? summary.totalDays
      : prefix === "concepts"
        ? concepts.length
        : experiments.length;
  const completed =
    prefix === "days"
      ? summary.completedDays
      : prefix === "concepts"
        ? summary.conceptsCompleted
        : summary.experimentsCompleted;
  const learning =
    prefix === "days"
      ? summary.learningDays
      : prefix === "concepts"
        ? summary.conceptsLearning
        : summary.experimentsLearning;

  return (
    <Card>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
        {prefix}
      </p>
      <p className="mt-2 font-mono text-2xl text-[var(--text)]">
        {completed}
        <span className="text-base text-[var(--faint)]"> / {total}</span>
      </p>
      <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">
        {learning} {statusLabel.learning.toLowerCase()} ·{" "}
        {Math.max(0, total - completed - learning)} {statusLabel.planned.toLowerCase()}
      </p>
    </Card>
  );
}

export function ProgressPage() {
  const questions = progress.questions.items;
  const openQuestions = questions.filter((item) => item.status !== "completed");
  const resolvedQuestions = questions.filter((item) => item.status === "completed");

  const activeDays = new Set(days.map((day) => day.date).filter(Boolean)).size;

  return (
    <PageContainer
      wide
      title="Progress"
      description="Everything on this page is computed by scripts/generate-progress.ts and written to data/progress.json. Nobody edits it by hand."
      meta={
        <a
          href={repoFileUrl(site.repo, "data/progress.json")}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
        >
          data/progress.json ↗
        </a>
      }
    >
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <CountCard prefix="days" />
        <CountCard prefix="concepts" />
        <CountCard prefix="experiments" />
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
            comparisons
          </p>
          <p className="mt-2 font-mono text-2xl text-[var(--text)]">
            {comparisons.length}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">
            architecture notes
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
            streak
          </p>
          <p className="mt-2 font-mono text-2xl text-[var(--text)]">{activeDays}</p>
          <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">active days</p>
        </Card>
      </div>

      <section className="mb-10">
        <SectionTitle hint={`${summary.totalDays} days planned`}>Timeline</SectionTitle>
        <Heatmap days={days} />
      </section>

      <section className="mb-10">
        <SectionTitle>Phases</SectionTitle>
        <div className="space-y-4">
          {progress.phases.map((phase) => (
            <div key={phase.id}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Link
                  to="/learn"
                  className="text-sm text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {phase.name}
                </Link>
                <span className="font-mono text-[11px] text-[var(--faint)]">
                  {phase.completed}/{phase.total} days · {phase.experiments} exps ·{" "}
                  {phase.concepts} concepts · {phase.progress}%
                </span>
              </div>
              <ProgressBar value={phase.progress} label={phase.name} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle hint={`${concepts.length} nodes`}>Concept mastery</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {concepts.map((concept) => (
            <Link key={concept.id} to={`/concepts/${concept.id}`} className="block">
              <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate text-[14px] font-medium text-[var(--text)]">
                    {concept.title}
                  </h3>
                  <span className="font-mono text-[11px] text-[var(--faint)]">
                    {concept.progress}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={concept.progress}
                    status={concept.status}
                    label={concept.title}
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          hint={
            <span className="font-mono text-[11px]">
              {summary.questionsResolved}/{summary.questionsAsked} resolved
            </span>
          }
        >
          Questions
        </SectionTitle>
        <div className="space-y-2">
          {openQuestions.map((item) => (
            <div
              key={`${item.path}:${item.slug}`}
              className="rounded-lg border border-[var(--warn)]/30 bg-[var(--surface)] p-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--warn)]">
                open · {item.slug}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--text)]">
                {item.question}
              </p>
              {item.concept && (
                <Link
                  to={`/concepts/${item.concept}`}
                  className="mt-1 inline-block font-mono text-[11px] text-[var(--faint)] hover:text-[var(--accent)]"
                >
                  {conceptById(item.concept)?.title ?? item.concept}
                </Link>
              )}
            </div>
          ))}
          {resolvedQuestions.map((item) => (
            <details
              key={`${item.path}:${item.slug}`}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"
            >
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ok)]">
                resolved · {item.slug}
              </summary>
              <p className="mt-2 text-[13px] leading-6 text-[var(--text)]">
                {item.question}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--dim)]">
                {item.explanation}
              </p>
            </details>
          ))}
          {questions.length === 0 && (
            <EmptyState
              title="No questions recorded"
              description="docs/questions/ holds the confusion that still has no answer."
            />
          )}
        </div>
      </section>
    </PageContainer>
  );
}
