import type { ContentBundle } from "./load.js";
import { PHASES, type PhaseProgress, type ProgressFile, type Status } from "./types.js";

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

/**
 * progress.json is derived state — never edited by hand (§9).
 * Everything below is computed from Markdown frontmatter only.
 */
export function buildProgress(
  bundle: ContentBundle,
  options: BuildOptions,
): ProgressFile {
  const { site, days, concepts, experiments, comparisons, questions } = bundle;

  const completedDays = days.filter((day) => day.status === "completed");
  const learningDays = days.filter((day) => day.status === "learning");
  const currentDay = completedDays.reduce(
    (max, day) => (Number.isFinite(day.day) && day.day > max ? day.day : max),
    0,
  );

  const total = Math.max(site.totalDays, days.length);

  const phases: PhaseProgress[] = PHASES.map((phase) => {
    const inPhase = days.filter((day) => day.phase === phase.id);
    const done = inPhase.filter((day) => day.status === "completed").length;
    const progress = rate(done, inPhase.length);
    const phaseConcepts = new Set(
      inPhase.flatMap((day) => (Number.isFinite(day.day) ? day.concepts : [])),
    );
    const phaseExperiments = experiments.filter((experiment) =>
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
      days: days.filter(
        (day) =>
          matches(day.trainingProject?.repo) || matches(day.productionProject?.repo),
      ).length,
      concepts: concepts.filter(
        (concept) =>
          matches(concept.trainingProject?.repo) ||
          matches(concept.productionProject?.repo),
      ).length,
      experiments: experiments.filter(
        (experiment) =>
          matches(experiment.trainingProject?.repo) ||
          matches(experiment.productionProject?.repo),
      ).length,
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
      plannedDays: days.filter((day) => day.status === "planned").length,
      currentDay,
      completionRate: rate(completedDays.length, total),
      conceptsCompleted: concepts.filter((concept) => concept.status === "completed")
        .length,
      conceptsLearning: concepts.filter((concept) => concept.status === "learning")
        .length,
      conceptsTotal: concepts.length,
      experimentsCompleted: experiments.filter(
        (experiment) => experiment.status === "completed",
      ).length,
      experimentsLearning: experiments.filter(
        (experiment) => experiment.status === "learning",
      ).length,
      experimentsTotal: experiments.length,
      comparisonsTotal: comparisons.length,
      questionsAsked: questions.asked,
      questionsResolved: questions.resolved,
      questionsOpen: questions.open,
      projects: projectStats,
    },
    skills: concepts
      .map((concept) => ({
        id: concept.id,
        name: concept.title,
        category: concept.category,
        status: concept.status,
        progress: concept.progress,
      }))
      .sort((a, b) => b.progress - a.progress || a.name.localeCompare(b.name)),
    phases,
    days: days.map((day) => ({
      day: day.day,
      title: day.title,
      status: day.status,
      phase: day.phase,
      date: day.date,
      path: day.path,
    })),
    questions,
  };
}
