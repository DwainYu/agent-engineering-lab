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
/**
 * Optional Chinese reading assistance for an English-first document.
 * Absent means the document has no assistance at all; it never means
 * "translate on demand".
 */
export type AssistMode = "brief" | "deep";
export const ASSIST_MODES: AssistMode[] = ["brief", "deep"];

export interface AssistConfig {
  language: "zh";
  mode: AssistMode;
}

export interface ParsedDoc {
  /** repo-relative path, e.g. docs/daily/day-01.md */
  path: string;
  data: Record<string, unknown>;
  body: string;
  /** set when the YAML block exists but cannot be parsed */
  parseError?: string;
}

export interface DayEntry {
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
  assist?: AssistConfig;

  body: string;
}

export interface ConceptEntry {
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
  assist?: AssistConfig;

  body: string;
}

export interface ExperimentEntry {
  kind: "experiment";
  slug: string;
  path: string;
  id: string;
  number: number;
  title: string;
  status: Status;
  language: string[];
  concepts: string[];
  day?: number;
  url?: string;
  summary?: string;
  trainingProject?: ProjectRef;
  productionProject?: ProjectRef;
  assist?: AssistConfig;

  body: string;
}

export interface ComparisonEntry {
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
  assist?: AssistConfig;

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
}

export interface ProgressDayItem {
  day: number;
  title: string;
  status: Status;
  phase: Phase;
  date: string;
  path: string;
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
