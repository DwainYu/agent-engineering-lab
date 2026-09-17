import type { Language } from "./language.js";

// Shared data contracts for the content engine.
// Everything here describes data that is GENERATED from Markdown frontmatter,
// never hand-written by the React app.

export type Status = "planned" | "learning" | "completed";
export const STATUSES: Status[] = ["planned", "learning", "completed"];

export type Phase =
  "fundamentals" | "runtime" | "context" | "memory" | "rag" | "evaluation" | "production";

export const PHASES: { id: Phase; name: string }[] = [
  { id: "fundamentals", name: "Agent Fundamentals" },
  { id: "runtime", name: "Agent Runtime" },
  { id: "context", name: "Context" },
  { id: "memory", name: "Memory" },
  { id: "rag", name: "RAG" },
  { id: "evaluation", name: "Evaluation" },
  { id: "production", name: "Production" },
];

/** Project pointer used by Day / Concept / Experiment frontmatter. */
export interface ProjectRef {
  repo: string;
  path?: string;
}
/******************************************************************************
 * Bilingual document contract
 ******************************************************************************/

export type TranslationStatus = "synced" | "outdated" | "missing";

/** How one language tree relates to another for the same stable `id`. */
export interface TranslationRef {
  status: TranslationStatus;
  /** path of the translated document; absent when the translation is missing */
  path?: string;
  /** `source_revision` declared by the translation */
  sourceRevision?: number;
}

export type TranslationMap = Partial<Record<Language, TranslationRef>>;

/**
 * Identity shared by the English source and its translations. `revision` is
 * the canonical counter English owns; `sourceRevision` is the value a
 * translation was produced from.
 */
export interface DocIdentity {
  id: string;
  language: Language;
  /** canonical revision — always present, `0` when the file omits it */
  revision: number;
  /** revision this document was translated from — translations only */
  sourceRevision?: number;
  /** state of every other language tree, keyed by language */
  translation: TranslationMap;
}

export interface ParsedDoc {
  /** repo-relative path, e.g. docs/daily/day-01.md */
  path: string;
  data: Record<string, unknown>;
  body: string;
  /** set when the YAML block exists but cannot be parsed */
  parseError?: string;
}

/** One row of `web/src/data/generated/sync.json` — always the English side. */
export interface SyncDocument {
  id: string;
  kind: DocKind;
  language: Language;
  revision: number;
  path: string;
  translation: TranslationMap;
}

export type DocKind = "day" | "concept" | "experiment" | "comparison";

/** Everything the website renders for one language. */
export interface LanguageBundle {
  language: Language;
  days: DayEntry[];
  concepts: ConceptEntry[];
  experiments: ExperimentEntry[];
  comparisons: ComparisonEntry[];
  questions: QuestionIndex;
}

export interface DayEntry extends DocIdentity {
  kind: "day";
  slug: string;
  path: string;
  day: number;
  title: string;
  date: string;
  status: Status;
  phase: Phase;
  topics: string[];
  concepts: string[];
  experiments: string[];
  sources: string[];
  difficulty?: string;
  estimatedTime?: string;
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;

  body: string;
}

export interface ConceptEntry extends DocIdentity {
  kind: "concept";
  slug: string;
  path: string;
  id: string;
  title: string;
  category: string;
  status: Status;
  progress: number;
  summary?: string;
  source?: string;
  prerequisites: string[];
  related: string[];
  experiments: string[];
  days: number[];
  tags: string[];
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;

  body: string;
}

export interface ExperimentEntry extends DocIdentity {
  kind: "experiment";
  slug: string;
  path: string;
  id: string;
  number: number;
  title: string;
  status: Status;
  /** implementation languages of the experiment code — never translated */
  stack: string[];
  /** where the runnable code lives; there is exactly one copy of it */
  code: { path: string; readme: string };
  concepts: string[];
  day?: number;
  url?: string;
  summary?: string;
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;

  body: string;
}

export interface ComparisonEntry extends DocIdentity {
  kind: "comparison";
  slug: string;
  path: string;
  id: string;
  title: string;
  date: string;
  status: Status;
  category: string;
  summary?: string;
  concepts: string[];
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;

  body: string;
}

export interface SkillProgress {
  id: string;
  name: string;
  category: string;
  status: Status;
  progress: number;
}

export interface KeyFile {
  path: string;
  description?: string;
}

export interface ProjectStats {
  id: string;
  name: string;
  role: ProjectRole;
  url: string;
  days: number;
  concepts: number;
  experiments: number;
}

export interface PhaseProgress {
  id: string;
  name: string;
  status: Status;
  progress: number;
  total: number;
  completed: number;
  experiments: number;
  concepts: number;
}

export type ProjectRole = "lab" | "training" | "production";

export interface ProgressSummary {
  totalDays: number;
  completedDays: number;
  learningDays: number;
  plannedDays: number;
  currentDay: number;
  completionRate: number;
  conceptsCompleted: number;
  conceptsLearning: number;
  conceptsTotal: number;
  experimentsCompleted: number;
  experimentsLearning: number;
  experimentsTotal: number;
  comparisonsTotal: number;
  questionsAsked: number;
  questionsResolved: number;
  questionsOpen: number;
  projects: ProjectStats[];

  /** one block per language tree — the bilingual half of the report */
  languages: Record<Language, LanguageProgress>;
  /** how many English documents have a matching, up-to-date translation */
  translation: TranslationCounts;
}

export interface LanguageProgress {
  completedDays: number;
  totalDays: number;
  conceptsCompleted: number;
  conceptsTotal: number;
  experimentsCompleted: number;
  experimentsTotal: number;
  comparisons: number;
  questions: number;
}

export interface TranslationCounts {
  synced: number;
  outdated: number;
  missing: number;
  total: number;
}

export interface ProgressDayItem {
  id: string;
  day: number;
  /** canonical English record */
  english: { path: string; revision: number };
  /** Chinese record, absent when the day has no Chinese document yet */
  chinese?: { path: string; sourceRevision?: number; status: TranslationStatus };
  title: string;
  status: Status;
  phase: Phase;
  date: string;
}

export interface QuestionItem {
  slug: string;
  status: Status;
  question: string;
  explanation?: string;
  day?: number;
  concept?: string;
  path: string;
}

export interface QuestionIndex {
  asked: number;
  resolved: number;
  open: number;
  items: QuestionItem[];
}

export interface ProgressFile {
  meta: {
    project: string;
    version: string;
    totalDays: number;
    updatedAt: string;
  };
  summary: ProgressSummary;
  skills: SkillProgress[];
  phases: PhaseProgress[];
  days: ProgressDayItem[];
  questions: QuestionIndex;
}

/** docs/glossary.yml — terminology contract read by the bilingual skill. */
export interface GlossaryTerm {
  /** spelling kept in English in both language trees */
  preferred: string;
  /** how the term may be glossed in Chinese */
  zh: string;
}

export interface GlossaryFile {
  terms: Record<string, GlossaryTerm>;
  /** UI label for a `status:` value, per language */
  statuses: Record<string, Record<Language, string>>;
  /** UI label for a translation sync state, per language */
  translation: Record<string, Record<Language, string>>;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  repo: string;
  totalDays: number;
  focus: { concept: string; description: string };
  projects: {
    id: string;
    name: string;
    role: ProjectRole;
    tagline: string;
    description: string;
    url: string;
    currentPhase?: string;
    focus: string[];
    keyFiles: KeyFile[];
  }[];
  philosophy: string[];
}
