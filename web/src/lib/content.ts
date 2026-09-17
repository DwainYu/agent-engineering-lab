import { SOURCE_LANGUAGE, type Language } from "../../../scripts/lib/language";
import type {
  ComparisonEntry,
  ConceptEntry,
  DayEntry,
  ExperimentEntry,
  LanguageBundle,
  ProgressFile,
  SiteConfig,
} from "../../../scripts/lib/types";
import contentEn from "../data/generated/content.en.json";
import contentZh from "../data/generated/content.zh.json";
import progressJson from "../data/generated/progress.json";
import siteJson from "../data/generated/site.json";
import { useLanguage } from "./language";

/**
 * The only place the front-end reads generated content.
 *
 * Both language trees are complete: `docs/en/**` carries the canonical articles,
 * `docs/zh/**` the Chinese review versions. Nothing here is hardcoded — add a
 * Markdown file, run `npm run generate`, and it shows up.
 */
export const content: Record<Language, LanguageBundle> = {
  en: contentEn as unknown as LanguageBundle,
  zh: contentZh as unknown as LanguageBundle,
};

export const site = siteJson as unknown as SiteConfig;
export const progress = progressJson as unknown as ProgressFile;
export const summary = progress.summary;

/**
 * English is canonical, so the flat collections below read the English tree.
 * Components that must follow the reader use `useDocs()`.
 */
export const days = content[SOURCE_LANGUAGE].days;
export const concepts = content[SOURCE_LANGUAGE].concepts;
export const experiments = content[SOURCE_LANGUAGE].experiments;
export const comparisons = content[SOURCE_LANGUAGE].comparisons;

export function docsFor(language: Language): LanguageBundle {
  return content[language];
}

/** Content set for the language the current URL points at. */
export function useDocs(): LanguageBundle {
  const { language } = useLanguage();
  return content[language];
}

export function sourceLanguage(): Language {
  return SOURCE_LANGUAGE;
}

export function phaseName(id: string): string {
  return progress.phases.find((phase) => phase.id === id)?.name ?? id;
}

/**
 * Lookups.
 *
 * Every lookup names the language tree it reads, because the two trees are
 * separate documents that merely share a stable id.
 */

export function conceptById(language: Language, id: string): ConceptEntry | undefined {
  return content[language].concepts.find((concept) => concept.id === id);
}

export function experimentById(
  language: Language,
  id: string,
): ExperimentEntry | undefined {
  return content[language].experiments.find((experiment) => experiment.id === id);
}

export function comparisonById(
  language: Language,
  id: string,
): ComparisonEntry | undefined {
  return content[language].comparisons.find((comparison) => comparison.id === id);
}

export function dayById(language: Language, id: string): DayEntry | undefined {
  return content[language].days.find((day) => day.id === id);
}

export function dayByNumber(
  language: Language,
  raw: string | undefined,
): DayEntry | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return undefined;
  return content[language].days.find((day) => day.day === parsed);
}

/** Days that reference a concept — the "learned on" trail of a knowledge node. */
export function daysForConcept(language: Language, id: string): DayEntry[] {
  return content[language].days.filter((day) => day.concepts.includes(id));
}

export function experimentsForConcept(language: Language, id: string): ExperimentEntry[] {
  return content[language].experiments.filter((experiment) =>
    experiment.concepts.includes(id),
  );
}

export function comparisonsForConcept(language: Language, id: string): ComparisonEntry[] {
  return content[language].comparisons.filter((comparison) =>
    comparison.concepts.includes(id),
  );
}

/** Newest completed first: what I actually worked on recently. */
export function recentDays(language: Language, count: number): DayEntry[] {
  return content[language].days
    .filter((day) => day.status !== "planned")
    .slice()
    .sort((a, b) => b.day - a.day)
    .slice(0, count);
}

export function currentFocus(language: Language): ConceptEntry | undefined {
  const wanted = site.focus.concept;
  const tree = content[language].concepts;
  return (
    tree.find((concept) => concept.id === wanted) ??
    tree.find((concept) => concept.status === "learning")
  );
}

/** Concept nodes grouped by the runtime layer they belong to. */
export function conceptsByCategory(
  language: Language,
): { category: string; items: ConceptEntry[] }[] {
  const groups = new Map<string, ConceptEntry[]>();
  for (const concept of content[language].concepts) {
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
