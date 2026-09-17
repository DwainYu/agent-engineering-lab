import {
  asDate,
  asNumber,
  asProjectRef,
  asString,
  asStringArray,
  extractFrontmatter,
  type RawDoc,
} from "./frontmatter.js";
import { DEFAULT_LANGUAGE, SOURCE_LANGUAGE, asLanguage, type Language } from "./language.js";
import type {
  ComparisonEntry,
  ConceptEntry,
  DayEntry,
  ParsedDoc,
  ProjectRef,
  Status,
} from "./types.js";
import { STATUSES } from "./types.js";

export interface Issue {
  level: "error" | "warning";
  file: string;
  message: string;
}

export function dirNameOf(path: string): string {
  return path.split("/").slice(0, -1).join("/");
}

export function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.(md|markdown)$/i, "");
}

export function parseSource(path: string, source: string): ParsedDoc {
  const raw: RawDoc = extractFrontmatter(source);
  const doc: ParsedDoc = { path, data: raw.data, body: raw.body };
  if (raw.parseError) doc.parseError = raw.parseError;
  return doc;
}

/**
 * Shared gate for every document kind: a frontmatter block that is absent or
 * unreadable is reported as itself, never as "missing field: id".
 */
function requireFrontmatter(doc: ParsedDoc, issues: Issue[], kind: string): boolean {
  if (doc.parseError) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `Invalid frontmatter: ${doc.parseError}`,
    });
    return false;
  }
  if (Object.keys(doc.data).length === 0) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `${kind} is missing YAML frontmatter`,
    });
    return false;
  }
  return true;
}

function asStatus(value: unknown): Status | undefined {
  const raw = asString(value)?.toLowerCase();
  return STATUSES.find((status) => status === raw);
}

function asStringArrayField(value: unknown): string[] {
  // `source:` entries may be plain urls or maps with a `url` key.
  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
        const nested =
          asString(record.url) ?? asString(record.link) ?? asString(record.href);
        if (nested) out.push(nested);
        continue;
      }
      const str = asString(item);
      if (str) out.push(str);
    }
    return out;
  }
  return asStringArray(value);
}

/* ------------------------------------------------------------------ *
 * Bilingual identity
 *
 * `id` is the stable key that pairs `docs/en/...` with `docs/zh/...`.
 * `language` is declared in the file AND validated against the tree it
 * lives in, so a document can never silently claim the wrong language.
 * ------------------------------------------------------------------ */

export interface DocIdentityDraft {
  id: string;
  language: Language;
  /** canonical revision; defaults to 0 when the file omits it */
  revision: number;
  /** revision this document was translated from; translations only */
  sourceRevision?: number;
}

interface RevisionRead {
  value?: number;
  valid: boolean;
}

/**
 * `revision` and `source_revision` are optional counters. An absent one reads
 * as `0`; a present-but-broken one is an error, because a counter nobody can
 * compare is worse than no counter at all.
 */
function readRevision(
  data: Record<string, unknown>,
  key: string,
  path: string,
  issues: Issue[],
): RevisionRead {
  const raw = data[key];
  if (raw === undefined || raw === null) return { valid: true };
  const num = asNumber(raw);
  if (num === undefined || !Number.isInteger(num) || num < 0) {
    issues.push({
      level: "error",
      file: path,
      message: `Field ${key} must be a non-negative integer, got ${JSON.stringify(raw)}`,
    });
    return { valid: false };
  }
  return { valid: true, value: num };
}

/**
 * @param expected language implied by the directory the file sits in
 *   (`docs/en/...` → `en`). Undefined for documents outside the language
 *   trees, such as `experiments/*\/README.md`.
 */
export function parseDocIdentity(
  data: Record<string, unknown>,
  path: string,
  issues: Issue[],
  expected?: Language,
): DocIdentityDraft | null {
  let ok = true;

  const id = asString(data.id);
  if (id === undefined) {
    issues.push({ level: "error", file: path, message: "Missing field: id" });
    ok = false;
  }

  const rawLanguage = data.language;
  const language = asLanguage(rawLanguage);
  if (language === undefined) {
    issues.push({
      level: "error",
      file: path,
      message:
        rawLanguage === undefined
          ? 'Missing field: language (expected "en" | "zh")'
          : `Invalid language: ${JSON.stringify(rawLanguage)} (expected "en" | "zh")`,
    });
    ok = false;
  } else if (expected !== undefined && language !== expected) {
    issues.push({
      level: "error",
      file: path,
      message: `language: ${language} does not match the directory it lives in (expected ${expected})`,
    });
    ok = false;
  }

  const revision = readRevision(data, "revision", path, issues);
  const sourceRevision = readRevision(data, "source_revision", path, issues);
  if (!revision.valid || !sourceRevision.valid) ok = false;

  if (
    sourceRevision.value !== undefined &&
    (language ?? SOURCE_LANGUAGE) === SOURCE_LANGUAGE
  ) {
    issues.push({
      level: "warning",
      file: path,
      message: "source_revision is ignored on a canonical English document",
    });
  }
  if (
    sourceRevision.value === undefined &&
    (language ?? SOURCE_LANGUAGE) !== SOURCE_LANGUAGE
  ) {
    issues.push({
      level: "error",
      file: path,
      message:
        "Missing field: source_revision (the English revision this was translated from)",
    });
    ok = false;
  }

  if (!ok || id === undefined || language === undefined) return null;
  return {
    id,
    language,
    revision: revision.value ?? 0,
    ...(sourceRevision.value === undefined ? {} : { sourceRevision: sourceRevision.value }),
  };
}

export function toDayEntry(
  doc: ParsedDoc,
  issues: Issue[],
  expected?: Language,
): Omit<DayEntry, "translation"> | null {
  if (!requireFrontmatter(doc, issues, "Day")) return null;
  const slug = slugFromPath(doc.path);
  const day = asNumber(doc.data.day);
  const title = asString(doc.data.title);
  if (title === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: title" });
  }
  if (day === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: day" });
  }
  const status = asStatus(doc.data.status);
  if (status === undefined) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `Invalid or missing field: status (expected ${STATUSES.join(" | ")})`,
    });
  }
  const date = asDate(doc.data.date);
  if (date === undefined) {
    issues.push({
      level: "error",
      file: doc.path,
      message: "Missing field: date (expected YYYY-MM-DD)",
    });
  }
  const phase = asString(doc.data.phase)?.toLowerCase();
  if (phase === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: phase" });
  }

  const identity = parseDocIdentity(doc.data, doc.path, issues, expected);
  if (!identity) return null;

  const experimentIds = asStringArrayField(doc.data.experiment);
  return {
    ...identity,
    kind: "day",
    slug,
    path: doc.path,
    day: day ?? Number.NaN,
    title: title ?? slug,
    date: date ?? "",
    status: status ?? "planned",
    phase: (phase ?? "fundamentals") as DayEntry["phase"],
    topics: asStringArrayField(doc.data.topics),
    concepts: asStringArrayField(doc.data.concepts),
    experiments: experimentIds,
    sources: asStringArrayField(doc.data.source ?? doc.data.sources),
    difficulty: asString(doc.data.difficulty),
    estimatedTime: asString(doc.data.estimated_time ?? doc.data.estimatedTime),
    trainingProject: asProjectRef(doc.data.training_project ?? doc.data.trainingProject),
    productionProject: asProjectRef(
      doc.data.production_project ?? doc.data.productionProject,
    ),

    body: doc.body,
  };
}

export function toConceptEntry(
  doc: ParsedDoc,
  issues: Issue[],
  expected?: Language,
): Omit<ConceptEntry, "translation"> | null {
  if (!requireFrontmatter(doc, issues, "Concept")) return null;
  const slug = slugFromPath(doc.path);
  const id = asString(doc.data.id) ?? slug;
  const title = asString(doc.data.title);
  if (title === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: title" });
  }
  const category = asString(doc.data.category);
  if (category === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: category" });
  }
  const status = asStatus(doc.data.status);
  if (status === undefined) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `Invalid or missing field: status (expected ${STATUSES.join(" | ")})`,
    });
  }
  const progressRaw = asNumber(doc.data.progress);
  const progress =
    progressRaw ?? (status === "completed" ? 100 : status === "learning" ? 50 : 0);
  if (progress < 0 || progress > 100) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `Field progress must be 0..100, got ${progress}`,
    });
  }
  const identity = parseDocIdentity(doc.data, doc.path, issues, expected);
  if (!identity) return null;

  return {
    ...identity,
    id,
    kind: "concept",
    slug,
    path: doc.path,
    title: title ?? id,
    category: category ?? "general",
    status: status ?? "planned",
    progress,
    summary: asString(doc.data.summary),
    source: asString(doc.data.source),
    prerequisites: asStringArrayField(doc.data.prerequisites),
    related: asStringArrayField(doc.data.related),
    experiments: asStringArrayField(doc.data.experiments ?? doc.data.experiment),
    days: asStringArrayField(doc.data.days).flatMap((value) => {
      const num = asNumber(value);
      return num === undefined ? [] : [num];
    }),
    tags: asStringArrayField(doc.data.tags),
    trainingProject: asProjectRef(doc.data.training_project ?? doc.data.trainingProject),
    productionProject: asProjectRef(
      doc.data.production_project ?? doc.data.productionProject,
    ),

    body: doc.body,
  };
}

/**
 * The runnable experiment lives in exactly one place — `experiments/<id>/` —
 * and its README is the canonical English lab notebook. A Chinese review
 * version may be layered on top from `docs/zh/experiments/<id>.md`; it never
 * duplicates the code.
 */
export interface ExperimentSourceDraft {
  slug: string;
  id: string;
  number: number;
  title: string;
  status: Status;
  stack: string[];
  concepts: string[];
  day?: number;
  url?: string;
  summary?: string;
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;
  code: { path: string; readme: string };
  revision: number;
  body: string;
  path: string;
}

export function toExperimentSource(
  doc: ParsedDoc,
  issues: Issue[],
): ExperimentSourceDraft | null {
  if (!requireFrontmatter(doc, issues, "Experiment")) return null;
  const dirName = doc.path.split("/").slice(-2)[0] ?? slugFromPath(doc.path);
  const id = asString(doc.data.id) ?? dirName;
  const number = asNumber(doc.data.number);
  if (number === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: number" });
  }
  const title = asString(doc.data.title);
  if (title === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: title" });
  }
  const status = asStatus(doc.data.status);
  if (status === undefined) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `Invalid or missing field: status (expected ${STATUSES.join(" | ")})`,
    });
  }
  const stack = asStringArrayField(doc.data.language ?? doc.data.languages);
  if (stack.length === 0) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: language" });
  }

  const revision = readRevision(doc.data, "revision", doc.path, issues);
  if (!revision.valid) return null;

  return {
    slug: dirName,
    id,
    number: number ?? Number.NaN,
    title: title ?? id,
    status: status ?? "planned",
    stack,
    concepts: asStringArrayField(doc.data.concepts),
    day: asNumber(doc.data.day),
    url: asString(doc.data.url ?? doc.data.github),
    summary: asString(doc.data.summary),
    trainingProject: asProjectRef(doc.data.training_project ?? doc.data.trainingProject),
    productionProject: asProjectRef(
      doc.data.related_production_project ??
        doc.data.production_project ??
        doc.data.productionProject,
    ),
    code: { path: dirNameOf(doc.path), readme: doc.path },
    revision: revision.value ?? 0,
    body: doc.body,
    path: doc.path,
  };
}

export interface ExperimentDocDraft {
  id: string;
  language: Language;
  revision: number;
  sourceRevision?: number;
  path: string;
  title?: string;
  summary?: string;
  body: string;
}

/** Language-specific experiment documentation under `docs/<lang>/experiments/`. */
export function toExperimentDoc(
  doc: ParsedDoc,
  issues: Issue[],
  expected?: Language,
): ExperimentDocDraft | null {
  if (!requireFrontmatter(doc, issues, "Experiment document")) return null;
  const identity = parseDocIdentity(doc.data, doc.path, issues, expected);
  if (!identity) return null;
  return {
    ...identity,
    path: doc.path,
    title: asString(doc.data.title),
    summary: asString(doc.data.summary),
    body: doc.body,
  };
}

export function toComparisonEntry(
  doc: ParsedDoc,
  issues: Issue[],
  expected?: Language,
): Omit<ComparisonEntry, "translation"> | null {
  if (!requireFrontmatter(doc, issues, "Comparison")) return null;
  const slug = slugFromPath(doc.path);
  const title = asString(doc.data.title);
  if (title === undefined) {
    issues.push({ level: "error", file: doc.path, message: "Missing field: title" });
  }
  const date = asDate(doc.data.date);
  if (date === undefined) {
    issues.push({
      level: "error",
      file: doc.path,
      message: "Missing field: date (expected YYYY-MM-DD)",
    });
  }
  const identity = parseDocIdentity(doc.data, doc.path, issues, expected);
  if (!identity) return null;

  return {
    ...identity,
    kind: "comparison",
    slug,
    path: doc.path,
    title: title ?? slug,
    date: date ?? "",
    status: asStatus(doc.data.status) ?? "completed",
    category: asString(doc.data.category) ?? "architecture",
    summary: asString(doc.data.summary),
    concepts: asStringArrayField(doc.data.concepts),
    trainingProject: asProjectRef(doc.data.training_project ?? doc.data.trainingProject),
    productionProject: asProjectRef(
      doc.data.production_project ?? doc.data.productionProject,
    ),

    body: doc.body,
  };
}

/** Where a document lives inside a language tree, e.g. `daily`. */
export type DocSection = "daily" | "concepts" | "experiments" | "comparisons" | "architecture";

export function languageOf(path: string, root = "docs"): Language | undefined {
  const match = new RegExp(`^${root}/(en|zh)/`).exec(path);
  return match?.[1] as Language | undefined;
}

export function defaultLanguageOf(): Language {
  return DEFAULT_LANGUAGE;
}

export function sourceLanguage(): Language {
  return SOURCE_LANGUAGE;
}
