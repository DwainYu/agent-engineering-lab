import { Link } from "react-router-dom";
import { site, summary } from "../../lib/content";
import { langHref, useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import { githubRepoUrl } from "../../lib/paths";

const LABEL: Record<string, string> = {
  training: "Training ground",
  production: "Production project",
};

export function ProjectStrip() {
  const { language } = useLanguage();

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
          {t(language, "home.landing")}
        </h2>
        <Link
          to={langHref(language, "projects")}
          className="text-xs text-[var(--faint)] hover:text-[var(--text)]"
        >
          the three-repo system →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {site.projects.map((project) => {
          const stats = summary.projects.find((item) => item.id === project.id);
          return (
            <a
              key={project.id}
              href={project.url || githubRepoUrl(project.id)}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]/40"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
                  {LABEL[project.role] ?? project.role}
                </span>
                <span className="font-mono text-[11px] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  {project.id}
                </span>
              </div>
              <h3 className="mt-2 text-[15px] font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                {project.name}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[var(--dim)]">
                {project.tagline}
              </p>
              {stats && (
                <p className="mt-4 font-mono text-[11px] text-[var(--faint)]">
                  {stats.days} days · {stats.concepts} concepts · {stats.experiments}{" "}
                  {t(language, "home.experimentsLinked")}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}
