import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Card, StatusPill } from "../components/ui/Primitives";
import { docsFor } from "../lib/content";
import { langHref, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { excerpt } from "../lib/markdown";

export function ExperimentsPage() {
  const { language } = useLanguage();
  const docs = docsFor(language);

  return (
    <PageContainer
      title={t(language, "label.experiments")}
      description={t(language, "experiments.description")}
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {t(language, "label.exps", { count: docs.experiments.length })}
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {docs.experiments.map((experiment) => (
          <Link
            key={experiment.id}
            to={langHref(language, `experiments/${experiment.id}`)}
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
                {experiment.stack.map((lang) => (
                  <span
                    key={lang}
                    className="rounded border border-[var(--line)] px-1.5 py-0.5"
                  >
                    {lang}
                  </span>
                ))}
                {typeof experiment.day === "number" && (
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
