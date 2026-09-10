import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseSource,
  toComparisonEntry,
  toConceptEntry,
  toDayEntry,
  toExperimentEntry,
  type Issue,
} from "./entries.js";
import { asString, asStringArray, asNumber } from "./frontmatter.js";
import type {
  ComparisonEntry,
  ConceptEntry,
  DayEntry,
  ExperimentEntry,
  KeyFile,
  ParsedDoc,
  ProjectRole,
  QuestionIndex,
  QuestionItem,
  SiteConfig,
  Status,
} from "./types.js";

export function repoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "../..");
}

export function readRepoFile(root: string, relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

function walkMarkdown(dir: string, root: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(full, root));
    } else if (/\.(md|markdown)$/i.test(entry.name)) {
      out.push(
        full
          .slice(root.length + 1)
          .split(/[\\/]/)
          .join("/"),
      );
    }
  }
  return out.sort();
}

function loadDocs(root: string, relativeDir: string): ParsedDoc[] {
  return walkMarkdown(join(root, relativeDir), root).map((relative) =>
    parseSource(relative, readFileSync(join(root, relative), "utf8")),
  );
}

export interface ContentBundle {
  root: string;
  site: SiteConfig;
  days: DayEntry[];
  concepts: ConceptEntry[];
  experiments: ExperimentEntry[];
  comparisons: ComparisonEntry[];
  questions: QuestionIndex;
  issues: Issue[];
}

/**
 * The single entry point of the content engine: Markdown in, typed data out.
 * Both `npm run validate` and `npm run generate` consume this.
 */
export function loadContent(root = repoRoot()): ContentBundle {
  const issues: Issue[] = [];
  const site = loadSiteConfig(root, issues);

  const days = loadDocs(root, "docs/daily")
    .map((doc) => toDayEntry(doc, issues))
    .filter((entry): entry is DayEntry => entry !== null)
    .sort((a, b) => a.day - b.day || a.slug.localeCompare(b.slug));

  const concepts = loadDocs(root, "docs/concepts")
    .map((doc) => toConceptEntry(doc, issues))
    .filter((entry): entry is ConceptEntry => entry !== null)
    .sort((a, b) => a.id.localeCompare(b.id));

  const experiments = loadDocs(root, "experiments")
    .filter((doc) => /(^|\/)README\.md$/i.test(doc.path))
    .map((doc) => toExperimentEntry(doc, issues))
    .filter((entry): entry is ExperimentEntry => entry !== null)
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));

  const comparisons = loadDocs(root, "docs/comparisons")
    .map((doc) => toComparisonEntry(doc, issues))
    .filter((entry): entry is ComparisonEntry => entry !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  const questions = indexQuestions(root, issues);

  return {
    root,
    site,
    days,
    concepts,
    experiments,
    comparisons,
    questions,
    issues,
  };
}

function loadSiteConfig(root: string, issues: Issue[]): SiteConfig {
  const file = join(root, "data", "site.json");
  const fallback: SiteConfig = {
    name: "Agent Engineering Lab",
    tagline: "Learn → Reproduce → Experiment → Build",
    description: "",
    repo: "DwainYu/agent-engineering-lab",
    totalDays: 30,
    focus: { concept: "", description: "" },
    projects: [],
    philosophy: [],
  };
  if (!existsSync(file)) {
    issues.push({
      level: "error",
      file: "data/site.json",
      message: "Missing site config",
    });
    return fallback;
  }
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    issues.push({
      level: "error",
      file: "data/site.json",
      message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    });
    return fallback;
  }
  const raw = (json ?? {}) as Record<string, unknown>;
  const focus = (raw.focus ?? {}) as Record<string, unknown>;
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  return {
    name: asString(raw.name) ?? fallback.name,
    tagline: asString(raw.tagline) ?? fallback.tagline,
    description: asString(raw.description) ?? "",
    repo: asString(raw.repo) ?? fallback.repo,
    totalDays: asNumber(raw.totalDays) ?? fallback.totalDays,
    focus: {
      concept: asString(focus.concept) ?? "",
      description: asString(focus.description) ?? "",
    },
    projects: projects.map((item) => {
      const project = (item ?? {}) as Record<string, unknown>;
      const role = asString(project.role);
      const focus = Array.isArray(project.focus) ? project.focus : [];
      const keyFiles = Array.isArray(project.key_files) ? project.key_files : [];
      return {
        id: asString(project.id) ?? "",
        name: asString(project.name) ?? "",
        role: (role === "production" || role === "lab"
          ? role
          : "training") as ProjectRole,
        tagline: asString(project.tagline) ?? "",
        description: asString(project.description) ?? "",
        url: asString(project.url) ?? "",
        currentPhase: asString(project.current_phase),
        focus: focus.map((entry) => asString(entry) ?? "").filter(Boolean),
        keyFiles: keyFiles.map((entry) => {
          const file = (entry ?? {}) as Record<string, unknown>;
          const record: KeyFile = {
            path: asString(file.path) ?? "",
            description: asString(file.description),
          };
          return record;
        }),
      };
    }),
    philosophy: asStringArray(raw.philosophy),
  };
}

/**
 * docs/questions/{open,resolved}.md hold one `## Q0xx` block per question.
 * The block body is plain prose: a question paragraph, `Status:`, `Created:`,
 * a `Related:` list, and for resolved ones an `**Answer**` section.
 */
function parseQuestionBlocks(root: string, issues: Issue[]): QuestionItem[] {
  const items: QuestionItem[] = [];

  for (const relative of ["docs/questions/open.md", "docs/questions/resolved.md"]) {
    const full = join(root, relative);
    if (!existsSync(full)) {
      if (relative.endsWith("open.md")) {
        issues.push({
          level: "warning",
          file: relative,
          message: "Questions file is missing",
        });
      }
      continue;
    }

    const source = readFileSync(full, "utf8");
    const chunks = source.split(/^## /m).slice(1);
    for (const chunk of chunks) {
      const [heading = "", ...rest] = chunk.split("\n");
      const slug = heading.trim();
      if (!/^Q\d+/.test(slug)) continue;
      const content = rest.join("\n").trim();

      const statusRaw = /^Status:\s*(.+)$/im.exec(content)?.[1]?.trim().toLowerCase();
      const status: Status =
        statusRaw === "resolved" || statusRaw === "completed"
          ? "completed"
          : statusRaw === "learning" || statusRaw === "open"
            ? "learning"
            : "planned";

      const answer = content.split(/^\*\*Answer\*\*/im)[1];
      const firstRelated = /Related:\s*\n((?:[-*]\s+.+\n?)+)/i
        .exec(content)?.[1]
        ?.split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean)[0];
      const dayRaw = /^Day:\s*(\d+)/im.exec(content)?.[1];

      items.push({
        slug,
        status,
        question: (content.split(/^Status:/im)[0] ?? "").replace(/\s+/g, " ").trim(),
        explanation: answer
          ? answer
              .replace(/^[\s>]+/, "")
              .replace(/\s+/g, " ")
              .trim()
          : undefined,
        day: dayRaw ? Number(dayRaw) : undefined,
        concept: firstRelated,
        path: relative,
      });
    }
  }

  return items;
}

function indexQuestions(root: string, issues: Issue[]): QuestionIndex {
  const items = parseQuestionBlocks(root, issues);
  const resolved = items.filter((item) => item.status === "completed").length;
  return {
    asked: items.length,
    resolved,
    open: items.length - resolved,
    items,
  };
}
