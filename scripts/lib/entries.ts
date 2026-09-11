import {
  asDate,
  asNumber,
  asProjectRef,
  asString,
  asStringArray,
  extractFrontmatter,
  type RawDoc,
} from "./frontmatter.js";
import type {
  AssistConfig,
  AssistMode,
  ComparisonEntry,
  ConceptEntry,
  DayEntry,
  ExperimentEntry,
  ParsedDoc,
  Status,
} from "./types.js";
import { ASSIST_MODES, STATUSES } from "./types.js";

export interface Issue {
  level: "error" | "warning";
  file: string;
  message: string;
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
 * unreadable is reported as itself, never as "missing field: title".
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
  if (!hasFrontmatter(doc)) {
    issues.push({
      level: "error",
      file: doc.path,
      message: `${kind} is missing YAML frontmatter`,
    });
    return false;
  }
  return true;
}

function hasFrontmatter(doc: ParsedDoc): boolean {
  return Object.keys(doc.data).length > 0;
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

/**
 * `assist: { language: zh, mode: brief | deep }` is optional on every document
 * kind. A malformed block is reported against the field instead of being
 * dropped: a note that believes it has Chinese assistance but does not is the
 * one failure this feature cannot have.
 */
function parseAssist(
  data: Record<string, unknown>,
  path: string,
  issues: Issue[],
): AssistConfig | undefined {
  const raw = data.assist;
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    issues.push({
      level: "error",
      file: path,
      message: 'assist must be a mapping with "language" and "mode"',
    });
    return undefined;
  }

  const record = raw as Record<string, unknown>;
  const language = asString(record.language);
  if (language === undefined) {
    issues.push({
      level: "error",
      file: path,
      message: 'Missing field: assist.language (expected "zh")',
    });
  } else if (language !== "zh") {
    issues.push({
      level: "error",
      file: path,
      message: `assist.language must be "zh", got ${language}`,
    });
  }

  const mode = asString(record.mode)?.toLowerCase();
  const valid = mode !== undefined && ASSIST_MODES.includes(mode as AssistMode);
  if (mode === undefined) {
    issues.push({
      level: "error",
      file: path,
      message: `Missing field: assist.mode (expected ${ASSIST_MODES.join(" | ")})`,
    });
  } else if (!valid) {
    issues.push({
      level: "error",
      file: path,
      message: `assist.mode must be ${ASSIST_MODES.join(" | ")}, got ${mode}`,
    });
  }

  return language === "zh" && valid
    ? { language: "zh", mode: mode as AssistMode }
    : undefined;
}

export function toDayEntry(doc: ParsedDoc, issues: Issue[]): DayEntry | null {
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

  const experimentIds = asStringArrayField(doc.data.experiment);
  return {
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
    assist: parseAssist(doc.data, doc.path, issues),

    body: doc.body,
  };
}

export function toConceptEntry(doc: ParsedDoc, issues: Issue[]): ConceptEntry | null {
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
  return {
    kind: "concept",
    slug,
    path: doc.path,
    id,
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
    assist: parseAssist(doc.data, doc.path, issues),

    body: doc.body,
  };
}

export function toExperimentEntry(
  doc: ParsedDoc,
  issues: Issue[],
): ExperimentEntry | null {
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
  return {
    kind: "experiment",
    slug: dirName,
    path: doc.path,
    id,
    number: number ?? Number.NaN,
    title: title ?? id,
    status: status ?? "planned",
    language: asStringArrayField(doc.data.language ?? doc.data.languages),
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
    assist: parseAssist(doc.data, doc.path, issues),

    body: doc.body,
  };
}

export function toComparisonEntry(
  doc: ParsedDoc,
  issues: Issue[],
): ComparisonEntry | null {
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
  return {
    kind: "comparison",
    slug,
    path: doc.path,
    id: asString(doc.data.id) ?? slug,
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
    assist: parseAssist(doc.data, doc.path, issues),

    body: doc.body,
  };
}
