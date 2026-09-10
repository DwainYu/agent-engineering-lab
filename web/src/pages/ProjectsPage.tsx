import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/Layout";
import { Card, SectionTitle } from "../components/ui/Primitives";
import { comparisons, conceptById, site, summary } from "../lib/content";
import { githubRepoUrl } from "../lib/paths";

const ROLE_LABEL: Record<string, string> = {
  lab: "Lab",
  training: "Training ground",
  production: "Production",
};

const ROLE_BLURB: Record<string, string> = {
  lab: "Records what I learned. Documents, concepts, experiment notebooks, progress — the website you are reading.",
  training:
    "Where I write the code myself, small and readable. Minimal dependencies, experiments first, nothing hidden behind a framework.",
  production:
    "Where a real product ships. Performance, reliability and cost pressure come from here, not from the training ground.",
};

export function ProjectsPage() {
  return (
    <PageContainer
      title="Projects"
      description="The learning system spans three repositories with one rule each: record it, practise it, ship it. Keeping them separate is what stops practice code from polluting production and production pressure from polluting practice."
      meta={
        <span className="font-mono text-[11px] text-[var(--faint)]">
          {site.projects.length} repositories
        </span>
      }
    >
      <section className="mb-10">
        <SectionTitle>How the three relate</SectionTitle>
        <div className="grid items-stretch gap-2 lg:grid-cols-7">
          {[
            "Principles",
            "Minimal implementation",
            "Training ground",
            "Production project",
          ].map((step, index) => (
            <div
              key={step}
              className={`rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center lg:col-span-${
                index === 3 ? 2 : 1
              }`}
            >
              <p className="font-mono text-[11px] text-[var(--dim)]">{step}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
                {["docs", "experiments", "set18", "set17"][index]}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">
          ↑ arrows are implied left-to-right; every hop is a commit in a different
          repository
        </p>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        {site.projects.map((project) => {
          const stats = summary.projects.find((item) => item.id === project.id);
          return (
            <Card key={project.id} className="flex flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--faint)]">
                  {ROLE_LABEL[project.role] ?? project.role}
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
                {ROLE_BLURB[project.role] ?? ""}
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
                      days
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] text-[var(--text)]">{stats.concepts}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--faint)]">
                      concepts
                    </p>
                  </div>
                  <div>
                    <p className="text-[15px] text-[var(--text)]">{stats.experiments}</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--faint)]">
                      exps
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
            <Link to="/concepts" className="hover:text-[var(--text)]">
              → concepts
            </Link>
          }
        >
          Why not just use a framework
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {comparisons.map((comparison) => (
            <Link
              key={comparison.id}
              to={`/comparisons/${comparison.id}`}
              className="block"
            >
              <Card className="h-full transition-colors hover:border-[var(--accent)]/40">
                <h3 className="text-[15px] font-medium text-[var(--text)]">
                  {comparison.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-[13px] leading-6 text-[var(--dim)]">
                  {comparison.concepts
                    .map((id) => conceptById(id)?.title ?? id)
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
