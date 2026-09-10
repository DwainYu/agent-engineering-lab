import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/learning/MarkdownContent";
import { PageContainer } from "../components/layout/Layout";
import { ProjectLinks } from "../components/projects/ProjectLinks";
import { CategoryPill, Pill, ProgressBar, StatusPill } from "../components/ui/Primitives";
import {
  conceptById,
  concepts,
  comparisonsForConcept,
  daysForConcept,
  experimentById,
  site,
} from "../lib/content";
import { repoFileUrl } from "../lib/paths";
import { NotFoundPage } from "./NotFoundPage";

function ChipList({
  title,
  ids,
  empty,
}: {
  title: string;
  ids: string[];
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
        {title}
      </p>
      {ids.length === 0 ? (
        <p className="mt-2 text-[13px] text-[var(--faint)]">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {ids.map((id) => (
            <li key={id}>
              <Link
                to={`/concepts/${id}`}
                className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[11px] text-[var(--dim)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                {conceptById(id)?.title ?? id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ConceptPage() {
  const { id } = useParams();
  const concept = id ? conceptById(id) : undefined;
  if (!concept) return <NotFoundPage />;

  const learnedOn = daysForConcept(concept.id);
  const experiments = concept.experiments
    .map((expId) => experimentById(expId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const comparisons = comparisonsForConcept(concept.id);
  const dependsOnMe = concepts.filter((other) =>
    other.prerequisites.includes(concept.id),
  );

  return (
    <PageContainer>
      <header className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/concepts"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] hover:text-[var(--text)]"
          >
            ← Concepts
          </Link>
          <span className="font-mono text-[11px] text-[var(--line)]">/</span>
          <span className="font-mono text-[11px] text-[var(--accent)]">{concept.id}</span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {concept.title}
        </h1>
        {concept.summary && (
          <p className="mt-2 text-[15px] leading-7 text-[var(--dim)]">
            {concept.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status={concept.status} />
          <CategoryPill>{concept.category}</CategoryPill>
          {concept.tags.map((tag) => (
            <Pill key={tag} className="border-[var(--line)] text-[var(--dim)]">
              {tag}
            </Pill>
          ))}
          <a
            href={repoFileUrl(site.repo, concept.path)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {concept.path} ↗
          </a>
        </div>

        <div className="mt-4 max-w-md">
          <ProgressBar
            value={concept.progress}
            status={concept.status}
            label={concept.title}
          />
        </div>
      </header>

      <div className="mt-8">
        <MarkdownContent content={concept.body} />
      </div>

      <aside className="mt-10 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
        <ChipList
          title="Prerequisites"
          ids={concept.prerequisites}
          empty="Starts from zero."
        />
        <ChipList
          title="Related"
          ids={concept.related}
          empty="No sibling concepts linked."
        />
        <ChipList
          title="Unlocks"
          ids={dependsOnMe.map((item) => item.id)}
          empty="Nothing depends on this yet."
        />

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            Experiments
          </p>
          {experiments.length === 0 ? (
            <p className="mt-2 text-[13px] text-[var(--faint)]">
              Not reproduced in code yet — that is the next step.
            </p>
          ) : (
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
          )}
        </div>

        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            Learned on
          </p>
          {learnedOn.length === 0 ? (
            <p className="mt-2 text-[13px] text-[var(--faint)]">
              No day references this concept.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {learnedOn.map((day) => (
                <li key={day.slug}>
                  <Link
                    to={`/learn/day/${day.day}`}
                    className="text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    Day {String(day.day).padStart(2, "0")} — {day.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ProjectLinks
          trainingProject={concept.trainingProject}
          productionProject={concept.productionProject}
        />

        {comparisons.length > 0 && (
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
              Comparisons
            </p>
            <ul className="mt-2 space-y-1.5">
              {comparisons.map((comparison) => (
                <li key={comparison.id}>
                  <Link
                    to={`/comparisons/${comparison.id}`}
                    className="text-[13px] text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    {comparison.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </PageContainer>
  );
}
