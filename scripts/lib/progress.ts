import type { ContentBundle } from "./load.js";
import { LANGUAGES, SOURCE_LANGUAGE, type Language } from "./language.js";
import { countTranslations } from "./translation.js";
import {
  PHASES,
  type LanguageProgress,
  type PhaseProgress,
  type ProgressDayItem,
  type ProgressFile,
  type Status,
} from "./types.js";

export interface BuildOptions {
  /** value written to meta.version */
  version: string;
  /** YYYY-MM-DD written to meta.updatedAt */
  today: string;
}

function rate(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function statusFromProgress(progress: number, total: number): Status {
  if (total > 0 && progress >= 100) return "completed";
  if (progress > 0) return "learning";
  return "planned";
}

function completed<T extends { status: Status }>(items: T[]): T[] {
  return items.filter((item) => item.status === "completed");
}

function languageProgress(bundle: ContentBundle, language: Language): LanguageProgress {
  const { days, concepts, experiments, comparisons, questions } = bundle.byLanguage[language];
  return {
    completedDays: completed(days).length,
    totalDays: days.length,
    conceptsCompleted: completed(concepts).length,
    conceptsTotal: concepts.length,
    experimentsCompleted: completed(experiments).length,
    experimentsTotal: experiments.length,
    comparisons: comparisons.length,
    questions: questions.asked,
  };
}

/**
 * progress.json is derived state — never edited by hand (§9).
 * Everything below is computed from Markdown frontmatter only, for both
 * language trees at once.
 */
export function buildProgress(
  bundle: ContentBundle,
  options: BuildOptions,
): ProgressFile {
  const { site } = bundle;
  const enBundle = bundle.byLanguage[SOURCE_LANGUAGE];

  const completedDays = completed(enBundle.days);
  const learningDays = enBundle.days.filter((day) => day.status === "learning");
  const currentDay = completedDays.reduce(
    (max, day) => (Number.isFinite(day.day) && day.day > max ? day.day : max),
    0,
  );

  const total = Math.max(site.totalDays, enBundle.days.length);

  const phases: PhaseProgress[] = PHASES.map((phase) => {
    const inPhase = enBundle.days.filter((day) => day.phase === phase.id);
    const done = completed(inPhase).length;
    const progress = rate(done, inPhase.length);
    const phaseConcepts = new Set(
      inPhase.flatMap((day) => (Number.isFinite(day.day) ? day.concepts : [])),
    );
    const phaseExperiments = enBundle.experiments.filter((experiment) =>
      inPhase.some((day) => day.day === experiment.day),
    );
    return {
      id: phase.id,
      name: phase.name,
      status:
        inPhase.length === 0 ? "planned" : statusFromProgress(progress, inPhase.length),
      progress,
      total: inPhase.length,
      completed: done,
      experiments: phaseExperiments.length,
      concepts: phaseConcepts.size,
    };
  });

  const projectStats = site.projects.map((project) => {
    const matches = (repo?: string) => repo === project.id;
    return {
      id: project.id,
      name: project.name,
      role: project.role,
      url: project.url,
      days: enBundle.days.filter(
        (day) =>
          matches(day.trainingProject?.repo) || matches(day.productionProject?.repo),
      ).length,
      concepts: enBundle.concepts.filter(
        (concept) =>
          matches(concept.trainingProject?.repo) ||
          matches(concept.productionProject?.repo),
      ).length,
      experiments: enBundle.experiments.filter(
        (experiment) =>
          matches(experiment.trainingProject?.repo) ||
          matches(experiment.productionProject?.repo),
      ).length,
    };
  });

  const days: ProgressDayItem[] = enBundle.days.map((day) => {
    const chinese = bundle.byLanguage.zh.days.find((item) => item.id === day.id);
    return {
      id: day.id,
      day: day.day,
      english: { path: day.path, revision: day.revision },
      ...(chinese
        ? {
            chinese: {
              path: chinese.path,
              ...(chinese.sourceRevision === undefined
                ? {}
                : { sourceRevision: chinese.sourceRevision }),
              status: day.translation.zh?.status ?? "missing",
            },
          }
        : {}),
      title: day.title,
      status: day.status,
      phase: day.phase,
      date: day.date,
    };
  });

  return {
    meta: {
      project: site.name,
      version: options.version,
      totalDays: total,
      updatedAt: options.today,
    },
    summary: {
      totalDays: total,
      completedDays: completedDays.length,
      learningDays: learningDays.length,
      plannedDays: enBundle.days.filter((day) => day.status === "planned").length,
      currentDay,
      completionRate: rate(completedDays.length, total),
      conceptsCompleted: enBundle.concepts.filter(
        (concept) => concept.status === "completed",
      ).length,
      conceptsLearning: enBundle.concepts.filter(
        (concept) => concept.status === "learning",
      ).length,
      conceptsTotal: enBundle.concepts.length,
      experimentsCompleted: completed(enBundle.experiments).length,
      experimentsLearning: enBundle.experiments.filter(
        (experiment) => experiment.status === "learning",
      ).length,
      experimentsTotal: enBundle.experiments.length,
      comparisonsTotal: enBundle.comparisons.length,
      questionsAsked: enBundle.questions.asked,
      questionsResolved: enBundle.questions.resolved,
      questionsOpen: enBundle.questions.open,
      projects: projectStats,

      languages: {
        en: languageProgress(bundle, "en"),
        zh: languageProgress(bundle, "zh"),
      } as Record<Language, LanguageProgress>,
      translation: countTranslations(bundle.translations),
    },
    skills: enBundle.concepts
      .map((concept) => ({
        id: concept.id,
        name: concept.title,
        category: concept.category,
        status: concept.status,
        progress: concept.progress,
      }))
      .sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name)),
    phases,
    days,
    questions: enBundle.questions,
  };
}

export function languagesOf(bundle: ContentBundle): Language[] {
  return LANGUAGES.filter((language) => bundle.byLanguage[language] !== undefined);
}
