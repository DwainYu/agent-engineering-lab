import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/learning/MarkdownContent";
import { PageContainer } from "../components/layout/Layout";
import { ProjectLinks } from "../components/projects/ProjectLinks";
import { CategoryPill, StatusPill } from "../components/ui/Primitives";
import { conceptById, comparisonById, site } from "../lib/content";
import { repoFileUrl } from "../lib/paths";
import { NotFoundPage } from "./NotFoundPage";

export function ComparisonPage() {
  const { id } = useParams();
  const comparison = id ? comparisonById(id) : undefined;
  if (!comparison) return <NotFoundPage />;

  return (
    <PageContainer>
      <header className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/concepts"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] hover:text-[var(--text)]"
          >
            ← Comparisons
          </Link>
          <span className="font-mono text-[11px] text-[var(--line)]">/</span>
          <span className="font-mono text-[11px] text-[var(--accent)]">
            {comparison.id}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-[28px]">
          {comparison.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill status={comparison.status} />
          <CategoryPill>{comparison.category}</CategoryPill>
          <span className="font-mono text-[11px] text-[var(--faint)]">
            {comparison.date}
          </span>
          <a
            href={repoFileUrl(site.repo, comparison.path)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto font-mono text-[11px] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {comparison.path} ↗
          </a>
        </div>
      </header>

      <div className="mt-8">
        <MarkdownContent content={comparison.body} />
      </div>

      <aside className="mt-10 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            Concepts
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {comparison.concepts.map((conceptId) => (
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
        </div>
        <ProjectLinks
          trainingProject={comparison.trainingProject}
          productionProject={comparison.productionProject}
        />
      </aside>
    </PageContainer>
  );
}
