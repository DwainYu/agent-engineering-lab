import type { ProjectRef } from "../../../../scripts/lib/types";
import { site } from "../../lib/content";
import { projectFileUrl } from "../../lib/paths";

function Row({ label, project }: { label: string; project: ProjectRef }) {
  const known = site.projects.find((item) => item.id === project.repo);
  const href = known?.url && !project.path ? known.url : projectFileUrl(project);
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
        {label}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 truncate text-right font-mono text-[12px] text-[var(--accent)] hover:underline"
      >
        {project.path ? `${project.repo}/${project.path}` : project.repo} ↗
      </a>
    </li>
  );
}

/**
 * Renders the `training_project` / `production_project` frontmatter pair:
 * principle → minimal implementation → training ground → production.
 */
export function ProjectLinks({
  trainingProject,
  productionProject,
  title = "Where it lives",
}: {
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;
  title?: string;
}) {
  if (!trainingProject && !productionProject) return null;

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
        {title}
      </p>
      <ul className="mt-2.5 space-y-2">
        {trainingProject && <Row label="Training" project={trainingProject} />}
        {productionProject && <Row label="Production" project={productionProject} />}
      </ul>
    </div>
  );
}
