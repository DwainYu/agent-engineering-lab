import { h2Headings } from "./frontmatter.js";
import type { Issue } from "./entries.js";
import { LANGUAGES, SOURCE_LANGUAGE, type Language } from "./language.js";
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

/** Chinese equivalents of the required Day sections. */
export const REQUIRED_DAY_SECTIONS_ZH = [
  "今日目标",
  "今天学到了什么",
  "仍然不理解的问题",
  "实验",
  "我的理解",
  "复习要点",
  "下一步",
] as const;

const KNOWN_PHASES = new Set(PHASES.map((phase) => phase.id));

function requiredDaySections(language: Language): readonly string[] {
  return language === "zh" ? REQUIRED_DAY_SECTIONS_ZH : REQUIRED_DAY_SECTIONS;
}

/**
 * Cross-document rules. Field-level rules already ran while parsing, so this
 * only adds checks that need the whole content set — including the invariant
 * that the Chinese tree cannot drift ahead of, or fall behind, the English one
 * without it being reported.
 */
export function validateContent(bundle: ContentBundle): Issue[] {
  const issues: Issue[] = [];
  const source = bundle.byLanguage[SOURCE_LANGUAGE];

  const conceptIds = new Set(source.concepts.map((concept) => concept.id));
  const experimentIds = new Set(source.experiments.map((experiment) => experiment.id));

  const seenDays = new Map<number, string>();
  for (const day of source.days) {
    if (!Number.isFinite(day.day)) continue;
    seenDays.set(day.day, day.path);
  }

  /* --- days ------------------------------------------------------- */
  for (const language of LANGUAGES) {
    const days = bundle.byLanguage[language].days;
    for (const day of days) {
      const expected = `day-${String(day.day).padStart(2, "0")}`;
      if (day.slug !== expected) {
        issues.push({
          level: "error",
          file: day.path,
          message: `day: ${day.day} does not match file name ${day.slug}.md (expected ${expected}.md)`,
        });
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
        issues.push({ level: "error", file: day.path, message: "Body is empty" });
      }
      if (day.status === "completed") {
        const headings = h2Headings(day.body);
        for (const section of requiredDaySections(language)) {
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
            message: `Unknown concept reference: ${ref}`,
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
  }

  /* --- concepts --------------------------------------------------- */
  for (const language of LANGUAGES) {
    const concepts = bundle.byLanguage[language].concepts;
    const seen = new Set<string>();
    for (const concept of concepts) {
      if (seen.has(concept.id)) {
        issues.push({
          level: "error",
          file: concept.path,
          message: `Duplicate concept id: ${concept.id}`,
        });
      }
      seen.add(concept.id);
      if (concept.slug !== concept.id) {
        issues.push({
          level: "error",
          file: concept.path,
          message: `id: ${concept.id} does not match file name ${concept.slug}.md`,
        });
      }
      if (concept.body.trim() === "") {
        issues.push({ level: "error", file: concept.path, message: "Body is empty" });
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
  }

  /* --- comparisons ------------------------------------------------ */
  for (const language of LANGUAGES) {
    for (const comparison of bundle.byLanguage[language].comparisons) {
      if (comparison.slug !== comparison.id) {
        issues.push({
          level: "error",
          file: comparison.path,
          message: `id: ${comparison.id} does not match file name ${comparison.slug}.md`,
        });
      }
      if (comparison.body.trim() === "") {
        issues.push({ level: "error", file: comparison.path, message: "Body is empty" });
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
  }

  /* --- experiments ------------------------------------------------ */
  const experimentCodeIds = new Set(
    source.experiments.map((experiment) => experiment.id),
  );
  for (const language of LANGUAGES) {
    for (const experiment of bundle.byLanguage[language].experiments) {
      if (!experimentCodeIds.has(experiment.id)) {
        issues.push({
          level: "error",
          file: experiment.path,
          message: `experiment "${experiment.id}" has no code directory under experiments/`,
        });
      }
      if (experiment.body.trim() === "") {
        issues.push({ level: "error", file: experiment.path, message: "Body is empty" });
      }
      if (experiment.stack.length === 0) {
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
    }
  }

  /* --- the day sequence itself ------------------------------------ */
  const declaredDays = new Map<number, string>();
  for (const day of source.days) {
    if (!Number.isFinite(day.day)) continue;
    const duplicate = declaredDays.get(day.day);
    if (duplicate) {
      issues.push({
        level: "error",
        file: day.path,
        message: `Duplicate day ${day.day}, also declared in ${duplicate}`,
      });
    } else {
      declaredDays.set(day.day, day.path);
    }
  }

  const missingDays: number[] = [];
  const maxDay = Math.max(0, ...declaredDays.keys());
  for (let day = 1; day <= maxDay; day += 1) {
    if (!declaredDays.has(day)) missingDays.push(day);
  }
  if (missingDays.length > 0) {
    issues.push({
      level: "warning",
      file: `docs/${SOURCE_LANGUAGE}/daily`,
      message: `Missing day numbers: ${missingDays.join(", ")}`,
    });
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
