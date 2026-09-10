import { Link, useParams } from "react-router-dom";
import { DayNav } from "../components/learning/DayNav";
import { MarkdownContent } from "../components/learning/MarkdownContent";
import { PageContainer } from "../components/layout/Layout";
import { CategoryPill, Pill, StatusPill } from "../components/ui/Primitives";
import { conceptById, days, experimentById, phaseName, site } from "../lib/content";
import { projectFileUrl, repoFileUrl } from "../lib/paths";
import { NotFoundPage } from "./NotFoundPage";

export function DayPage() {
  const { day: param } = useParams();
  const day = days.find((item) => String(item.day) === param);
  if (!day) return <NotFoundPage />;

  const experiments = day.experiments
    .map((id) => experimentById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const concepts = day.concepts
    .map((id) => conceptById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <PageContainer>
      <header className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/learn"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] hover:text-[var(--text)]"
          >
            ← Learning
          </Link>
          <span className="font-mono text-[11px] text-[var(--line)]">/</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">
            Day {String(day.day).padStart(2, "0")}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {day.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status={day.status} />
          <CategoryPill>{phaseName(day.phase)}</CategoryPill>
          {day.difficulty && (
            <Pill className="border-[var(--line)] text-[var(--dim)]">
              {day.difficulty}
            </Pill>
          )}
          {day.estimatedTime && (
            <Pill className="border-[var(--line)] text-[var(--dim)]">
              ≈ {day.estimatedTime}
            </Pill>
          )}
          <a
            href={repoFileUrl(site.repo, day.path)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {day.path} ↗
          </a>
        </div>

        {day.topics.length > 0 && (
          <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">
            {day.topics.map((topic) => `#${topic}`).join("  ")}
          </p>
        )}
      </header>

      <div className="mt-8">
        <MarkdownContent content={day.body} />
      </div>

      {(experiments.length > 0 ||
        concepts.length > 0 ||
        day.trainingProject ||
        day.sources.length > 0) && (
        <aside className="mt-10 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
          {experiments.length > 0 && (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                Experiment
              </p>
              <ul className="mt-2 space-y-1.5">
                {experiments.map((experiment) => (
                  <li key={experiment.id}>
                    <Link
                      to={`/experiments/${experiment.id}`}
                      className="text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
                    >
                      #{String(experiment.number).padStart(3, "0")} {experiment.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {concepts.length > 0 && (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                Concepts
              </p>
              <ul className="mt-2 space-y-1.5">
                {concepts.map((concept) => (
                  <li key={concept.id}>
                    <Link
                      to={`/concepts/${concept.id}`}
                      className="text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
                    >
                      {concept.title}
                      <span className="ml-2 font-mono text-[11px] text-[var(--faint)]">
                        {concept.progress}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {day.trainingProject && (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                Training project
              </p>
              <a
                href={projectFileUrl(day.trainingProject)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block truncate font-mono text-[12px] text-[var(--accent)]"
              >
                {day.trainingProject.repo}/{day.trainingProject.path ?? ""} ↗
              </a>
            </div>
          )}

          {day.sources.length > 0 && (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
                Sources
              </p>
              <ul className="mt-2 space-y-1.5">
                {day.sources.map((source) => (
                  <li key={source} className="truncate">
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[12px] text-[var(--dim)] hover:text-[var(--accent)]"
                    >
                      {source.replace(/^https?:\/\//, "")} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}

      <DayNav day={day.day} />
    </PageContainer>
  );
}
