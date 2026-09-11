import type {
  ComparisonEntry,
  ConceptEntry,
  DayEntry,
  ExperimentEntry,
  ProgressFile,
  SiteConfig,
} from "../../../scripts/lib/types";
import comparisonsJson from "../data/generated/comparisons.json";
import conceptsJson from "../data/generated/concepts.json";
import daysJson from "../data/generated/days.json";
import experimentsJson from "../data/generated/experiments.json";
import progressJson from "../data/generated/progress.json";
import siteJson from "../data/generated/site.json";

/**
 * The only place the front-end reads generated content.
 * Nothing here is hardcoded — add a Markdown file, run `npm run generate`,
 * and it shows up.
 */
export const site = siteJson as unknown as SiteConfig;
export const progress = progressJson as unknown as ProgressFile;
export const days = (daysJson as unknown as DayEntry[])
  .slice()
  .sort((a, b) => a.day - b.day);
export const concepts = (conceptsJson as unknown as ConceptEntry[])
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title));
export const experiments = (experimentsJson as unknown as ExperimentEntry[])
  .slice()
  .sort((a, b) => a.number - b.number);
export const comparisons = (comparisonsJson as unknown as ComparisonEntry[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

export const summary = progress.summary;

export const phaseName = (id: string): string =>
  progress.phases.find((phase) => phase.id === id)?.name ?? id;

export const conceptById = (id: string): ConceptEntry | undefined =>
  concepts.find((concept) => concept.id === id);

export const experimentById = (id: string): ExperimentEntry | undefined =>
  experiments.find((experiment) => experiment.id === id);

export const comparisonById = (id: string): ComparisonEntry | undefined =>
  comparisons.find((comparison) => comparison.id === id);

export function dayByNumber(raw: string | undefined): DayEntry | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return undefined;
  return days.find((day) => day.day === parsed);
}

/** Days that reference a concept — the "learned on" trail of a knowledge node. */
export function daysForConcept(id: string): DayEntry[] {
  return days.filter((day) => day.concepts.includes(id));
}

export function experimentsForConcept(id: string): ExperimentEntry[] {
  return experiments.filter((experiment) => experiment.concepts.includes(id));
}

export function comparisonsForConcept(id: string): ComparisonEntry[] {
  return comparisons.filter((comparison) => comparison.concepts.includes(id));
}

/**
 * Does the document behind this route carry Chinese assistance? The reading
 * mode switch appears only where the answer is yes: an empty toggle is worse
 * than no toggle, because it promises text that is not there.
 */
export function assistOnPath(pathname: string): boolean {
  const param = (pattern: RegExp) => pathname.match(pattern)?.[1];

  const day = param(/^\/learn\/day\/([^/]+)$/);
  if (day !== undefined) return dayByNumber(day)?.assist !== undefined;

  const concept = param(/^\/concepts\/([^/]+)$/);
  if (concept !== undefined)
    return conceptById(decodeURIComponent(concept))?.assist !== undefined;

  const experiment = param(/^\/experiments\/([^/]+)$/);
  if (experiment !== undefined)
    return experimentById(decodeURIComponent(experiment))?.assist !== undefined;

  const comparison = param(/^\/comparisons\/([^/]+)$/);
  if (comparison !== undefined)
    return comparisonById(decodeURIComponent(comparison))?.assist !== undefined;

  return false;
}

/** Newest completed first: what I actually worked on recently. */
export function recentDays(count: number): DayEntry[] {
  return days
    .filter((day) => day.status !== "planned")
    .slice()
    .sort((a, b) => b.day - a.day)
    .slice(0, count);
}

export function currentFocus(): ConceptEntry | undefined {
  const wanted = site.focus.concept;
  return (
    concepts.find((concept) => concept.id === wanted) ??
    concepts.find((concept) => concept.status === "learning")
  );
}

/** Concept nodes grouped by the runtime layer they belong to. */
export function conceptsByCategory(): { category: string; items: ConceptEntry[] }[] {
  const groups = new Map<string, ConceptEntry[]>();
  for (const concept of concepts) {
    const list = groups.get(concept.category) ?? [];
    list.push(concept);
    groups.set(concept.category, list);
  }
  const order = [
    "fundamentals",
    "runtime",
    "context",
    "tools",
    "knowledge",
    "quality",
    "architecture",
  ];
  return [...groups.entries()]
    .sort(
      (a, b) =>
        (order.indexOf(a[0]) === -1 ? 99 : order.indexOf(a[0])) -
          (order.indexOf(b[0]) === -1 ? 99 : order.indexOf(b[0])) ||
        a[0].localeCompare(b[0]),
    )
    .map(([category, items]) => ({ category, items }));
}

export function statsCard(): { label: string; value: string | number }[] {
  return [
    { label: "Days", value: summary.totalDays },
    { label: "Completed", value: summary.completedDays },
    { label: "Concepts", value: summary.conceptsTotal },
    { label: "Experiments", value: summary.experimentsTotal },
  ];
}
