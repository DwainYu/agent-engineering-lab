import { site, summary } from "../../lib/content";
import { githubRepoUrl } from "../../lib/paths";

const PIPELINE = [
  "Learn",
  "Read Source",
  "Ask AI",
  "Implement",
  "Review",
  "Document",
  "Commit",
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="font-mono text-[12px] font-semibold text-[var(--text)]">
            {site.name}
          </p>
          <p className="mt-2 max-w-xs text-[13px] leading-6 text-[var(--dim)]">
            {site.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PIPELINE.map((step) => (
              <span
                key={step}
                className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--faint)]"
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
            Repository pipeline
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-5 text-[var(--dim)]">
            {`git commit -m "day${String(summary.currentDay + 1).padStart(2, "0")}: ..."
        ↓
GitHub Actions
        ↓
validate → generate → build → deploy`}
          </pre>
          <p className="mt-3 text-[12px] leading-5 text-[var(--faint)]">
            Progress numbers on this site are generated from Markdown in this repository,
            not entered by hand.
          </p>
        </div>

        <div className="lg:justify-self-end">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
            Projects
          </p>
          <ul className="mt-3 space-y-2 text-[13px]">
            {site.projects.map((project) => (
              <li key={project.id}>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--dim)] transition-colors hover:text-[var(--accent)]"
                >
                  {project.name}
                  <span className="ml-2 font-mono text-[11px] text-[var(--faint)]">
                    {project.role}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href={githubRepoUrl(site.repo)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block font-mono text-[12px] text-[var(--faint)] hover:text-[var(--text)]"
          >
            {site.repo}
          </a>
        </div>
      </div>
    </footer>
  );
}
