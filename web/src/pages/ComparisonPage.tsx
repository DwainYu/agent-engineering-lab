import { Link, useParams } from "react-router-dom";
import { MarkdownContent } from "../components/learning/MarkdownContent";
import { PageContainer } from "../components/layout/Layout";
import { ProjectLinks } from "../components/projects/ProjectLinks";
import { CategoryPill, StatusPill } from "../components/ui/Primitives";
import { comparisonById, site, sourceLanguage } from "../lib/content";
import { langHref, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { repoFileUrl } from "../lib/paths";
import { NotFoundPage } from "./NotFoundPage";
import { TranslationMissing } from "../components/learning/TranslationNotice";

export function ComparisonPage() {
  const { language } = useLanguage();

  const { id } = useParams();
  const comparison = id ? comparisonById(language, id) : undefined;
  if (!comparison) {
    // Exists in the English source but not yet translated: name the gap rather
    // than serve English under a /zh URL, or claim the page is missing.
    const canonical = id ? comparisonById(sourceLanguage(), id) : undefined;
    if (canonical)
      return (
        <TranslationMissing
          language={language}
          title={canonical.title}
          path={`comparisons/${canonical.id}`}
        />
      );
    return <NotFoundPage />;
  }

  return (
    <PageContainer>
      <header className="border-b border-[var(--line)] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={langHref(language, "comparisons")}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {t(language, "comparison.back")}
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
            {t(language, "label.concepts")}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {comparison.concepts.map((conceptId) => (
              <li key={conceptId}>
                <Link
                  to={langHref(language, `concepts/${conceptId}`)}
                  className="rounded border border-[var(--line)] px-2 py-0.5 font-mono text-[11px] text-[var(--dim)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                >
                  {comparisonById(language, conceptId)?.title ?? conceptId}
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
