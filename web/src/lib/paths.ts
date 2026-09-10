import type { ProjectRef } from "../../../scripts/lib/types";

/** Absolute-ish base, works locally ("/") and on Pages ("/agent-engineering-lab/"). */
export const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export function asset(path: string): string {
  return `${basename}${path.replace(/^\//, "")}`;
}

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

/**
 * Turn a frontmatter project pointer into a GitHub link.
 * `path` may be a file or a directory (it keeps its trailing slash).
 */
export function projectFileUrl(ref: ProjectRef, commit = "main"): string {
  const base = githubRepoUrl(ref.repo);
  if (!ref.path) return base;
  const isDir = ref.path.endsWith("/");
  const kind = isDir ? "tree" : "blob";
  return `${base}/${kind}/${commit}/${ref.path.replace(/^\/+/, "")}`;
}

export function repoFileUrl(repo: string, path: string): string {
  return projectFileUrl({ repo, path });
}

/** "docs/daily/day-01.md" → label like "docs/daily/day-01.md" kept as-is. */
export function fileName(path: string): string {
  return path.split("/").pop() ?? path;
}

export function repoPathLabel(siteRepo: string, path: string): string {
  return `${siteRepo}/${path}`;
}

export function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith("mailto:");
}
