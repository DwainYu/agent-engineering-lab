import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Card, SectionTitle } from "../components/ui/Primitives";
import { docsFor, conceptById, site, summary } from "../lib/content";
import { langHref, useLanguage } from "../lib/language";
import { t, type StringKey } from "../lib/strings";
import { githubRepoUrl } from "../lib/paths";

const ROLE_LABEL: Record<string, StringKey> = {
  lab: "label.role.lab",
  training: "label.role.training",
  production: "label.role.production",
};

const ROLE_BLURB: Record<string, StringKey> = {
  lab: "about.principle.0.body",
  training: "about.principle.1.body",
  production: "about.principle.4.body",
};

export function ProjectsPage() {
  const { language } = useLanguage();
  const docs = docsFor(language);

  return (
    <PageContainer
      title={t(language, "nav.projects")}
      description={t(language, "projects.description")}
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {site.projects.length} {t(language, "label.projects")}
        </span>
      }
    >
      <section className="mb-10">
        <SectionTitle>{t(language, "projects.relate")}</SectionTitle>
        <div className="grid items-stretch gap-2 lg:grid-cols-7">
          {(
            [
              "about.principle.2.title",
              "label.notebook",
              "label.role.training",
              "label.role.production",
            ] as const
          ).map((key, index) => (
            <div
              key={key}
              className={`rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center lg:col-span-${
                index === 3 ? 2 : 1
              }`}
            >
              <p className="font-mono text-[11px] text-[var(--dim)]">
                {t(language, key)}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
                {["docs", "experiments", "set18", "set17"][index]}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">
          {t(language, "projects.about.arrows")}
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        {site.projects.map((project) => {
          const stats = summary.projects.find((item) => item.id === project.id);
          return (
            <Card key={project.id} className="flex flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
                  {t(language, ROLE_LABEL[project.role] ?? "label.role.lab")}
                </span>
                <span className="font-mono text-[11px] text-[var(--accent)]">
                  {project.currentPhase ?? project.id}
                </span>
              </div>

              <h2 className="mt-2 font-mono text-[15px] font-semibold text-[var(--text)]">
                <a
                  href={project.url || githubRepoUrl(project.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--accent)]"
                >
                  {project.id} ↗
                </a>
              </h2>

              <p className="mt-1 text-[13px] font-medium text-[var(--text)]">
                {project.name}
              </p>
              <p className="mt-3 text-[13px] leading-6 text-[var(--dim)]">
                {project.tagline}
              </p>
              <p className="mt-3 text-[12px] leading-6 text-[var(--faint)]">
                {t(language, ROLE_BLURB[project.role] ?? "about.principle.0.body")}
              </p>

              {project.focus.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.focus.map((item) => (
                    <li
                      key={item}
                      className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--dim)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {stats && (
                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-4 font-mono text-center">
                  <div>
                    <p className="text-[15px] text-[var(--text)]">{stats.days}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--faint)]">
                      {t(language, "label.daysPlural")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] text-[var(--text)]">{stats.concepts}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--faint)]">
                      {t(language, "label.conceptsPlural")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] text-[var(--text)]">{stats.experiments}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--faint)]">
                      {t(language, "label.expsPlural")}
                    </p>
                  </div>
                </div>
              )}

              {project.keyFiles.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {project.keyFiles.map((file) => (
                    <li key={file.path} className="truncate">
                      <a
                        href={githubRepoUrl(project.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-[var(--faint)] hover:text-[var(--accent)]"
                      >
                        {file.path}
                        {file.description ? ` — ${file.description}` : ""}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <section className="mt-12">
        <SectionTitle
          hint={
            <Link
              to={langHref(language, "concepts")}
              className="hover:text-[var(--text)]"
            >
              → {t(language, "nav.concepts")}
            </Link>
          }
        >
          {t(language, "label.headline")}
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {docs.comparisons.map((comparison) => (
            <Link
              key={comparison.id}
              to={langHref(language, `comparisons/${comparison.id}`)}
              className="block"
            >
              <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
                <h3 className="text-[15px] font-medium text-[var(--text)]">
                  {comparison.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[var(--dim)]">
                  {comparison.concepts
                    .map((id) => conceptById(language, id)?.title ?? id)
                    .join(" · ")}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
