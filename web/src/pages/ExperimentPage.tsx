import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/learning/MarkdownContent";
import { PageContainer } from "../components/layout/Layout";
import { ProjectLinks } from "../components/projects/ProjectLinks";
import { Pill, StatusPill } from "../components/ui/Primitives";
import { conceptById, dayByNumber, experimentById, site } from "../lib/content";
import { repoFileUrl } from "../lib/paths";
import { NotFoundPage } from "./NotFoundPage";

export function ExperimentPage() {
  const { id } = useParams();
  const experiment = id ? experimentById(id) : undefined;
  if (!experiment) return <NotFoundPage />;

  const day = dayByNumber(experiment.day == null ? undefined : String(experiment.day));

  return (
    <PageContainer>
      <header className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/experiments"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] hover:text-[var(--text)]"
          >
            ← Experiments
          </Link>
          <span className="font-mono text-[11px] text-[var(--line)]">/</span>
          <span className="font-mono text-[11px] text-[var(--accent)]">
            {String(experiment.number).padStart(3, "0")}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {experiment.title}
        </h1>
        {experiment.summary && (
          <p className="mt-2 text-[15px] leading-7 text-[var(--dim)]">
            {experiment.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status={experiment.status} />
          {experiment.language.map((language) => (
            <Pill key={language} className="border-[var(--line)] text-[var(--dim)]">
              {language}
            </Pill>
          ))}
          {day && (
            <Link
              to={`/learn/day/${day.day}`}
              className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[11px] text-[var(--dim)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
            >
              Day {String(day.day).padStart(2, "0")}
            </Link>
          )}
          <a
            href={repoFileUrl(site.repo, experiment.path)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {experiment.path} ↗
          </a>
        </div>
      </header>

      <div className="mt-8">
        <MarkdownContent content={experiment.body} />
      </div>

      <aside className="mt-10 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
        <ProjectLinks
          trainingProject={experiment.trainingProject}
          productionProject={experiment.productionProject}
          title="Code location"
        />

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            Concepts
          </p>
          {experiment.concepts.length === 0 ? (
            <p className="mt-2 text-[13px] text-[var(--faint)]">
              No concepts linked yet.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {experiment.concepts.map((conceptId) => (
                <li key={conceptId}>
                  <Link
                    to={`/concepts/${conceptId}`}
                    className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[11px] text-[var(--dim)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                  >
                    {conceptById(conceptId)?.title ?? conceptId}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </PageContainer>
  );
}
