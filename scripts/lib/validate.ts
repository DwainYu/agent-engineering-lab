import { h2Headings } from "./frontmatter.js";
import type { Issue } from "./entries.js";
import type { ContentBundle } from "./load.js";
import { PHASES } from "./types.js";

/** Sections every finished Day must contain (§7 / §35). */
export const REQUIRED_DAY_SECTIONS = [
  "Today's Goal",
  "What I Learned",
  "What I Didn't Understand",
  "Experiment",
  "My Own Explanation",
  "Key Takeaways",
  "Next",
] as const;

const KNOWN_PHASES = new Set(PHASES.map((phase) => phase.id));

/**
 * Cross-document rules. Field-level rules already ran while parsing,
 * so this only adds checks that need the whole content set.
 */
export function validateContent(bundle: ContentBundle): Issue[] {
  const issues: Issue[] = [];
  const { days, concepts, experiments, comparisons } = bundle;

  const conceptIds = new Set(concepts.map((concept) => concept.id));
  const experimentIds = new Set(experiments.map((exp) => exp.id));

  const seenDays = new Map<number, string>();
  for (const day of days) {
    if (!Number.isFinite(day.day)) continue;

    const expected = `day-${String(day.day).padStart(2, "0")}`;
    if (day.slug !== expected) {
      issues.push({
        level: "error",
        file: day.path,
        message: `day: ${day.day} does not match file name ${day.slug}.md (expected ${expected}.md)`,
      });
    }
    const duplicate = seenDays.get(day.day);
    if (duplicate) {
      issues.push({
        level: "error",
        file: day.path,
        message: `Duplicate day ${day.day}, also declared in ${duplicate}`,
      });
    } else {
      seenDays.set(day.day, day.path);
    }

    if (!KNOWN_PHASES.has(day.phase)) {
      issues.push({
        level: "error",
        file: day.path,
        message: `Unknown phase: ${day.phase} (expected one of ${[...KNOWN_PHASES].join(", ")})`,
      });
    }
    if (day.topics.length === 0) {
      issues.push({
        level: "error",
        file: day.path,
        message: "Missing field: topics (at least one topic required)",
      });
    }
    if (day.body.trim() === "") {
      issues.push({
        level: "error",
        file: day.path,
        message: "Body is empty",
      });
    }
    if (day.status === "completed") {
      const headings = h2Headings(day.body);
      for (const section of REQUIRED_DAY_SECTIONS) {
        if (!headings.includes(section)) {
          issues.push({
            level: "error",
            file: day.path,
            message: `status: completed requires the section "## ${section}"`,
          });
        }
      }
    }
    for (const ref of day.concepts) {
      if (!conceptIds.has(ref)) {
        issues.push({
          level: "warning",
          file: day.path,
          message: `Unknown concept reference: ${ref} (no docs/concepts/${ref}.md)`,
        });
      }
    }
    for (const ref of day.experiments) {
      if (!experimentIds.has(ref)) {
        issues.push({
          level: "warning",
          file: day.path,
          message: `Unknown experiment reference: ${ref}`,
        });
      }
    }
    if (day.status === "completed" && day.experiments.length === 0) {
      issues.push({
        level: "warning",
        file: day.path,
        message: "Completed day has no linked experiment",
      });
    }
  }

  const missingDays: number[] = [];
  const maxDay = Math.max(
    0,
    ...days.map((day) => (Number.isFinite(day.day) ? day.day : 0)),
  );
  for (let day = 1; day <= maxDay; day += 1) {
    if (!seenDays.has(day)) missingDays.push(day);
  }
  if (missingDays.length > 0) {
    issues.push({
      level: "warning",
      file: "docs/daily",
      message: `Missing day numbers: ${missingDays.join(", ")}`,
    });
  }

  const seenConcepts = new Set<string>();
  for (const concept of concepts) {
    if (seenConcepts.has(concept.id)) {
      issues.push({
        level: "error",
        file: concept.path,
        message: `Duplicate concept id: ${concept.id}`,
      });
    }
    seenConcepts.add(concept.id);
    if (concept.slug !== concept.id) {
      issues.push({
        level: "error",
        file: concept.path,
        message: `id: ${concept.id} does not match file name ${concept.slug}.md`,
      });
    }
    if (concept.body.trim() === "") {
      issues.push({
        level: "error",
        file: concept.path,
        message: "Body is empty",
      });
    }
    for (const ref of [...concept.prerequisites, ...concept.related]) {
      if (!conceptIds.has(ref)) {
        issues.push({
          level: "warning",
          file: concept.path,
          message: `Unknown concept reference: ${ref}`,
        });
      }
    }
    for (const ref of concept.experiments) {
      if (!experimentIds.has(ref)) {
        issues.push({
          level: "warning",
          file: concept.path,
          message: `Unknown experiment reference: ${ref}`,
        });
      }
    }
  }

  const seenExperiments = new Set<string>();
  for (const experiment of experiments) {
    if (seenExperiments.has(experiment.id)) {
      issues.push({
        level: "error",
        file: experiment.path,
        message: `Duplicate experiment id: ${experiment.id}`,
      });
    }
    seenExperiments.add(experiment.id);
    if (experiment.slug !== experiment.id) {
      issues.push({
        level: "error",
        file: experiment.path,
        message: `id: ${experiment.id} does not match directory name ${experiment.slug}/`,
      });
    }
    if (Number.isFinite(experiment.number)) {
      const dirNumber = Number.parseInt(experiment.slug.split("-")[0] ?? "", 10);
      if (Number.isFinite(dirNumber) && dirNumber !== experiment.number) {
        issues.push({
          level: "error",
          file: experiment.path,
          message: `number: ${experiment.number} does not match directory prefix ${experiment.slug}`,
        });
      }
    }
    if (experiment.language.length === 0) {
      issues.push({
        level: "error",
        file: experiment.path,
        message: "Missing field: language",
      });
    }
    if (experiment.day !== undefined && !seenDays.has(experiment.day)) {
      issues.push({
        level: "warning",
        file: experiment.path,
        message: `day: ${experiment.day} has no matching Day note`,
      });
    }
    for (const ref of experiment.concepts) {
      if (!conceptIds.has(ref)) {
        issues.push({
          level: "warning",
          file: experiment.path,
          message: `Unknown concept reference: ${ref}`,
        });
      }
    }
  }

  for (const comparison of comparisons) {
    if (comparison.slug !== comparison.id) {
      issues.push({
        level: "error",
        file: comparison.path,
        message: `id: ${comparison.id} does not match file name ${comparison.slug}.md`,
      });
    }
    if (comparison.body.trim() === "") {
      issues.push({
        level: "error",
        file: comparison.path,
        message: "Body is empty",
      });
    }
    for (const ref of comparison.concepts) {
      if (!conceptIds.has(ref)) {
        issues.push({
          level: "warning",
          file: comparison.path,
          message: `Unknown concept reference: ${ref}`,
        });
      }
    }
  }

  return issues;
}

export function summarize(issues: Issue[]): {
  errors: Issue[];
  warnings: Issue[];
} {
  return {
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}
