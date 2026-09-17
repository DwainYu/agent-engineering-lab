import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Heatmap } from "../components/progress/Heatmap";
import { Card, EmptyState, ProgressBar, SectionTitle } from "../components/ui/Primitives";
import { conceptById, docsFor, progress, site, summary } from "../lib/content";
import { langHref, useLanguage, type Language } from "../lib/language";
import { t, type StringKey } from "../lib/strings";
import { repoFileUrl } from "../lib/paths";

function CountCard({
  prefix,
  language,
  total,
  completed,
  learning,
}: {
  prefix: "days" | "concepts" | "experiments";
  language: Language;
  total: number;
  completed: number;
  learning: number;
}) {
  const labelKey: StringKey =
    prefix === "days"
      ? "label.daysPlanned"
      : prefix === "concepts"
        ? "label.concepts"
        : "label.experiments";

  return (
    <Card>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
        {t(language, labelKey)}
      </p>
      <p className="mt-2 font-mono text-2xl text-[var(--text)]">
        {completed}
        <span className="text-base text-[var(--faint)]"> / {total}</span>
      </p>
      <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">
        {learning} {t(language, "label.status.learning")} ·{" "}
        {Math.max(0, total - completed - learning)} {t(language, "label.status.planned")}
      </p>
    </Card>
  );
}

export function ProgressPage() {
  const { language } = useLanguage();
  const docs = docsFor(language);

  const questions = progress.questions.items;
  const openQuestions = questions.filter((item) => item.status !== "completed");
  const resolvedQuestions = questions.filter((item) => item.status === "completed");

  const activeDays = new Set(docs.days.map((day) => day.date).filter(Boolean)).size;

  return (
    <PageContainer
      wide
      title={t(language, "nav.progress")}
      description={t(language, "progress.description")}
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
        <CountCard
          prefix="days"
          language={language}
          total={summary.totalDays}
          completed={summary.completedDays}
          learning={summary.learningDays}
        />
        <CountCard
          prefix="concepts"
          language={language}
          total={docs.concepts.length}
          completed={summary.conceptsCompleted}
          learning={summary.conceptsLearning}
        />
        <CountCard
          prefix="experiments"
          language={language}
          total={docs.experiments.length}
          completed={summary.experimentsCompleted}
          learning={summary.experimentsLearning}
        />
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
            {t(language, "label.comparisons")}
          </p>
          <p className="mt-2 font-mono text-2xl text-[var(--text)]">
            {docs.comparisons.length}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">
            {t(language, "progress.comparisonsSub")}
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
            {t(language, "label.streak")}
          </p>
          <p className="mt-2 font-mono text-2xl text-[var(--text)]">{activeDays}</p>
          <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">
            {t(language, "progress.streakNote")}
          </p>
        </Card>
      </div>

      <section className="mb-10">
        <SectionTitle
          hint={t(language, "progress.planned", { count: summary.totalDays })}
        >
          {t(language, "label.timeline")}
        </SectionTitle>
        <Heatmap days={docs.days} />
      </section>

      <section className="mb-10">
        <SectionTitle>{t(language, "label.phases")}</SectionTitle>
        <div className="space-y-4">
          {progress.phases.map((phase) => (
            <div key={phase.id}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Link
                  to={langHref(language, "learn")}
                  className="text-sm text-[var(--text)] hover:text-[var(--accent)]"
                >
                  {phase.name}
                </Link>
                <span className="font-mono text-[11px] text-[var(--faint)]">
                  {t(language, "progress.phaseFooter", {
                    completed: phase.completed,
                    total: phase.total,
                    experiments: phase.experiments,
                    concepts: phase.concepts,
                    percent: phase.progress,
                  })}
                </span>
              </div>
              <ProgressBar value={phase.progress} label={phase.name} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle hint={t(language, "label.nodes", { count: docs.concepts.length })}>
          {t(language, "label.mastery")}
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.concepts.map((concept) => (
            <Link
              key={concept.id}
              to={langHref(language, `concepts/${concept.id}`)}
              className="block"
            >
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
              {summary.questionsResolved}/{summary.questionsAsked}{" "}
              {t(language, "progress.questionResolved")}
            </span>
          }
        >
          {t(language, "progress.questions")}
        </SectionTitle>
        <div className="space-y-2">
          {openQuestions.map((item) => (
            <div
              key={`${item.path}:${item.slug}`}
              className="rounded-lg border border-[var(--warn)]/30 bg-[var(--surface)] p-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--warn)]">
                {t(language, "progress.questionOpen")} · {item.slug}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--text)]">
                {item.question}
              </p>
              {item.concept && (
                <Link
                  to={langHref(language, `concepts/${item.concept}`)}
                  className="mt-1 inline-block font-mono text-[11px] text-[var(--faint)] hover:text-[var(--accent)]"
                >
                  {conceptById(language, item.concept)?.title ?? item.concept}
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
                {t(language, "progress.questionResolved")} · {item.slug}
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
              title={t(language, "questions.emptyTitle")}
              description={t(language, "questions.emptyBody")}
            />
          )}
        </div>
      </section>
    </PageContainer>
  );
}
