import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseSource,
  toComparisonEntry,
  toConceptEntry,
  toDayEntry,
  toExperimentDoc,
  toExperimentSource,
  type DocSection,
  type ExperimentDocDraft,
  type ExperimentSourceDraft,
  type Issue,
} from "./entries.js";
import { parse as parseYaml } from "yaml";
import { asString, asStringArray, asNumber } from "./frontmatter.js";
import { LANGUAGES, SOURCE_LANGUAGE, type Language } from "./language.js";
import { translationRef } from "./translation.js";
import type {
  ComparisonEntry,
  GlossaryFile,
  GlossaryTerm,
  ConceptEntry,
  DayEntry,
  ExperimentEntry,
  KeyFile,
  LanguageBundle,
  ParsedDoc,
  ProjectRole,
  QuestionIndex,
  QuestionItem,
  SiteConfig,
  Status,
  SyncDocument,
  TranslationMap,
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
  /** docs/glossary.yml — terminology contract for the bilingual workflow */
  glossary: GlossaryFile;
  languages: Language[];
  /** what the website renders, one bundle per language tree */
  byLanguage: Record<Language, LanguageBundle>;
  /** one row per English document, carrying the state of every translation */
  translations: SyncDocument[];
  issues: Issue[];
}

/**
 * The single entry point of the content engine: Markdown in, typed data out.
 * Both `npm run validate` and `npm run generate` consume this.
 *
 * Scan order:
 *
 *   docs/en/**\/*.md    canonical source tree
 *   docs/zh/**\/*.md    complete Chinese tree
 *   experiments/**\/README.md   canonical English lab notebook
 */
export function loadContent(root = repoRoot()): ContentBundle {
  const issues: Issue[] = [];
  const site = loadSiteConfig(root, issues);
  const glossary = loadGlossary(root, issues);

  const enTree = loadLanguageTree(root, "en", issues);
  const zhTree = loadLanguageTree(root, "zh", issues);

  const days = joinLanguageTrees(enTree.days, zhTree.days, "day", issues);
  const concepts = joinLanguageTrees(enTree.concepts, zhTree.concepts, "concept", issues);
  const comparisons = joinLanguageTrees(
    enTree.comparisons,
    zhTree.comparisons,
    "comparison",
    issues,
  );

  const experiments = buildExperiments(
    loadDocs(root, "experiments")
      .filter((doc) => /(^|\/)README\.md$/i.test(doc.path))
      .map((doc) => toExperimentSource(doc, issues))
      .filter(
        (entry): entry is ExperimentSourceDraft =>
          entry !== null && Number.isFinite(entry.number),
      )
      .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id)),
    { en: enTree.experiments, zh: zhTree.experiments },
    issues,
  );

  const byLanguage: Record<Language, LanguageBundle> = {
    en: {
      language: "en",
      days: days.en,
      concepts: concepts.en,
      experiments: experiments.en,
      comparisons: comparisons.en,
      questions: enTree.questions,
    },
    zh: {
      language: "zh",
      days: days.zh,
      concepts: concepts.zh,
      experiments: experiments.zh,
      comparisons: comparisons.zh,
      questions: zhTree.questions,
    },
  };

  const translations = buildSyncIndex({
    days: byLanguage[SOURCE_LANGUAGE].days,
    concepts: byLanguage[SOURCE_LANGUAGE].concepts,
    experiments: byLanguage[SOURCE_LANGUAGE].experiments,
    comparisons: byLanguage[SOURCE_LANGUAGE].comparisons,
  });

  return {
    root,
    site,
    glossary,
    languages: [...LANGUAGES],
    byLanguage,
    translations,
    issues,
  };
}

interface LanguageTree {
  days: Omit<DayEntry, "translation">[];
  concepts: Omit<ConceptEntry, "translation">[];
  experiments: ExperimentDocDraft[];
  comparisons: Omit<ComparisonEntry, "translation">[];
  questions: QuestionIndex;
}

function loadLanguageTree(
  root: string,
  language: Language,
  issues: Issue[],
): LanguageTree {
  const dir = join(root, "docs", language);
  const section = (name: DocSection): ParsedDoc[] =>
    existsSync(join(dir, name)) ? loadDocs(root, `docs/${language}/${name}`) : [];

  return {
    days: section("daily")
      .map((doc) => toDayEntry(doc, issues, language))
      .filter((entry): entry is Omit<DayEntry, "translation"> => entry !== null),
    concepts: section("concepts")
      .map((doc) => toConceptEntry(doc, issues, language))
      .filter((entry): entry is Omit<ConceptEntry, "translation"> => entry !== null),
    experiments: section("experiments")
      .map((doc) => toExperimentDoc(doc, issues, language))
      .filter((entry): entry is ExperimentDocDraft => entry !== null),
    // Comparisons now also pull in architecture notes (e.g. "How This Learning
    // System Works"). They share the same frontmatter shape and the same route.
    comparisons: [
      ...section("comparisons")
        .map((doc) => toComparisonEntry(doc, issues, language))
        .filter((entry): entry is Omit<ComparisonEntry, "translation"> => entry !== null),
      ...section("architecture")
        .map((doc) => toComparisonEntry(doc, issues, language))
        .filter((entry): entry is Omit<ComparisonEntry, "translation"> => entry !== null),
    ],
    questions: indexQuestions(root, language, issues),
  };
}

/* ------------------------------------------------------------------ *
 * Translation pairing
 *
 * Both sides are complete documents. The English side owns `revision`, the
 * translation declares `source_revision`; the difference is the drift.
 * ------------------------------------------------------------------ */

interface Joinable {
  id: string;
  path: string;
  revision: number;
  sourceRevision?: number;
}

function joinLanguageTrees<E extends Joinable>(
  sources: E[],
  targets: E[],
  kind: SyncDocument["kind"],
  issues: Issue[],
): {
  en: (E & { translation: TranslationMap })[];
  zh: (E & { translation: TranslationMap })[];
} {
  const targetById = new Map<string, E>(targets.map((target) => [target.id, target]));
  const sourceById = new Map<string, E>(sources.map((source) => [source.id, source]));

  const en = sources.map((source) => ({
    ...source,
    translation: { zh: translationRef(source, targetById.get(source.id)) },
  }));

  const zh = targets.map((target) => ({
    ...target,
    translation: { en: translationRef(sourceById.get(target.id), target) },
  }));

  for (const target of targets) {
    if (!sourceById.has(target.id)) {
      issues.push({
        level: "error",
        file: target.path,
        message: `${kind} "${target.id}" has no English source with the same id under docs/en/`,
      });
    }
  }

  return { en, zh };
}

function buildExperiments(
  sources: ExperimentSourceDraft[],
  docs: { en: ExperimentDocDraft[]; zh: ExperimentDocDraft[] },
  issues: Issue[],
): { en: ExperimentEntry[]; zh: ExperimentEntry[] } {
  const buildEntry = (
    source: ExperimentSourceDraft,
    doc: ExperimentDocDraft | undefined,
    language: Language,
    translation: ExperimentEntry["translation"],
  ): ExperimentEntry => ({
    id: source.id,
    kind: "experiment",
    slug: source.slug,
    path: doc?.path ?? source.path,
    number: source.number,
    title: doc?.title ?? source.title,
    status: source.status,
    stack: source.stack,
    concepts: source.concepts,
    ...(source.day === undefined ? {} : { day: source.day }),
    ...(source.url === undefined ? {} : { url: source.url }),
    ...((doc?.summary ?? source.summary)
      ? { summary: doc?.summary ?? source.summary }
      : {}),
    code: source.code,
    ...(source.trainingProject ? { trainingProject: source.trainingProject } : {}),
    ...(source.productionProject ? { productionProject: source.productionProject } : {}),
    language,
    revision: source.revision,
    ...(doc?.sourceRevision === undefined ? {} : { sourceRevision: doc.sourceRevision }),
    body: doc?.body ?? source.body,
    translation,
  });

  const en: ExperimentEntry[] = [];
  const zh: ExperimentEntry[] = [];
  const enDocById = new Map(docs.en.map((doc) => [doc.id, doc]));
  const zhDocById = new Map(docs.zh.map((doc) => [doc.id, doc]));

  for (const source of sources) {
    const enDoc = enDocById.get(source.id);
    const zhDoc = zhDocById.get(source.id);
    const sourceRef = { id: source.id, path: source.path, revision: source.revision };

    const enEntry = buildEntry(source, enDoc, "en", {
      zh: translationRef(sourceRef, zhDoc),
    });
    en.push(enEntry);

    if (zhDoc) {
      zh.push(
        buildEntry(source, zhDoc, "zh", {
          en: translationRef(sourceRef, zhDoc),
        }),
      );
    }
  }

  for (const doc of docs.zh) {
    if (!sources.some((source) => source.id === doc.id)) {
      issues.push({
        level: "error",
        file: doc.path,
        message: `experiment "${doc.id}" has no code directory under experiments/`,
      });
    }
  }

  return { en, zh };
}

function buildSyncIndex(source: {
  days: DayEntry[];
  concepts: ConceptEntry[];
  experiments: ExperimentEntry[];
  comparisons: ComparisonEntry[];
}): SyncDocument[] {
  const rows: SyncDocument[] = [];
  const push = (
    kind: SyncDocument["kind"],
    entry: DayEntry | ConceptEntry | ExperimentEntry | ComparisonEntry,
  ) => {
    rows.push({
      id: entry.id,
      kind,
      language: entry.language,
      revision: entry.revision,
      path: entry.path,
      translation: entry.translation,
    });
  };
  for (const day of source.days) push("day", day);
  for (const concept of source.concepts) push("concept", concept);
  for (const experiment of source.experiments) push("experiment", experiment);
  for (const comparison of source.comparisons) push("comparison", comparison);
  return rows;
}

/** docs/glossary.yml is a contract file: present, parseable, complete. */
function loadGlossary(root: string, issues: Issue[]): GlossaryFile {
  const file = join(root, "docs", "glossary.yml");
  const empty: GlossaryFile = { terms: {}, statuses: {}, translation: {} };
  if (!existsSync(file)) {
    issues.push({
      level: "error",
      file: "docs/glossary.yml",
      message: "Missing glossary (docs/glossary.yml)",
    });
    return empty;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(readFileSync(file, "utf8"));
  } catch (error) {
    issues.push({
      level: "error",
      file: "docs/glossary.yml",
      message: `Invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
    });
    return empty;
  }

  const raw = (parsed ?? {}) as Record<string, unknown>;
  const terms: Record<string, GlossaryTerm> = {};
  const source = (raw.terms ?? {}) as Record<string, unknown>;
  for (const [name, value] of Object.entries(source)) {
    const record = (value ?? {}) as Record<string, unknown>;
    const preferred = asString(record.preferred);
    const zh = asString(record.zh);
    if (preferred === undefined || zh === undefined) {
      issues.push({
        level: "error",
        file: "docs/glossary.yml",
        message: `Term "${name}" needs both "preferred" and "zh"`,
      });
      continue;
    }
    terms[name] = { preferred, zh };
  }

  return {
    terms,
    statuses: asLabelMap(raw.statuses),
    translation: asLabelMap(raw.translation),
  };
}

function asLabelMap(value: unknown): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  const source = (value ?? {}) as Record<string, unknown>;
  for (const [key, entry] of Object.entries(source)) {
    const record = (entry ?? {}) as Record<string, unknown>;
    out[key] = {
      en: asString(record.en) ?? key,
      zh: asString(record.zh) ?? key,
    };
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Site config
 * ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ *
 * Questions
 *
 * docs/<lang>/questions/{open,resolved}.md hold one `## Q0xx` block per
 * question. The block body is plain prose: a question paragraph, `Status:`,
 * `Created:`, a `Related:` list, and for resolved ones an `**Answer**`
 * section. The key inside a language tree is `Status:`; the section headings
 * stay stable so both trees parse with the same code.
 * ------------------------------------------------------------------ */

function parseQuestionBlocks(
  root: string,
  language: Language,
  issues: Issue[],
): QuestionItem[] {
  const items: QuestionItem[] = [];

  for (const name of ["open", "resolved"]) {
    const relative = `docs/${language}/questions/${name}.md`;
    const full = join(root, relative);
    if (!existsSync(full)) {
      if (name === "open") {
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
        ...(dayRaw ? { day: Number(dayRaw) } : {}),
        ...(firstRelated ? { concept: firstRelated } : {}),
        path: relative,
      });
    }
  }

  return items;
}

function indexQuestions(
  root: string,
  language: Language,
  issues: Issue[],
): QuestionIndex {
  const items = parseQuestionBlocks(root, language, issues);
  const resolved = items.filter((item) => item.status === "completed").length;
  return {
    asked: items.length,
    resolved,
    open: items.length - resolved,
    items,
  };
}

export type { ExperimentSourceDraft, ExperimentDocDraft, DocSection, SyncDocument };
